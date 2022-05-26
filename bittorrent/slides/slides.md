---
# try also 'default' to start simple
theme: seriph
# random image from a curated Unsplash collection by Anthony
# like them? see https://unsplash.com/collections/94734566/slidev
background: https://source.unsplash.com/collection/94734566/1920x1080
# apply any windi css classes to the current slide
class: 'text-center'
# https://sli.dev/custom/highlighters.html
highlighter: shiki
# show line numbers in code blocks
lineNumbers: false
# some information about the slides, markdown enabled
info: |
  ## Slidev Starter Template
  Presentation slides for developers.

  Learn more at [Sli.dev](https://sli.dev)
# persist drawings in exports and build
drawings:
  persist: false
---

# BitTorrent

Brief intro and how to write a simple client

---

# What is BitTorrent?

Wikipedia: BitTorrent is a communication protocol for peer-to-peer file sharing (P2P), which enables users to distribute data and electronic files over the Internet in a decentralized manner.

<img src="/arch.png" class="h-90" />

<!--
1. download torrent file
Torrent file contains information about the
file, its length, name, and hashing information, and
the url of a tracker.

2. ask tracker for peers
Trackers are responsible for helping downloaders find each other.  They speak a very
simple protocol layered on top of HTTP in which
a downloader sends information about what file it’s
downloading, what port it’s listening on, and similar
information, and the tracker responds with a list of
contact information for peers which are downloading
the same file.

3. contacting peers to download file
In order to keep track of which peers have what,
BitTorrent cuts files into pieces of fixed size, typically a quarter megabyte. Each downloader reports
to all of its peers what pieces it has.
To verify data integrity, the SHA1 hashes of all the pieces are included in the .torrent file, and peers don’t report that they have a piece until they’ve checked the hash.

Although the tracker only helps peers to find each other and its traffic is so low that it can never be the bottleneck of the system. It still doesn't feel so distributed with such a centralised server that is so crucial. New methods cut out the middleman by making even peer discovery a distributed process. We won’t be talking about them, but if you’re interested, some terms you can research are DHT, magnet links and so on.

With the traditional client-server file download, all upload cost is placed on the hosting machine. With BitTorrent, when multiple people are downloading the same file at the same time, they upload pieces of the file
to each other. This redistributes the cost of upload
to downloaders.
-->

---

# Roles



-  **Torrent file** -  a metadata file that contains info about the file and the url of a tracker.
-  **Tracker** - a server that helps downloaders/peers find each other.
-  **Peer/Downloader** - clients that wants to download file.
-  **Seeder** - peers who have the complete file and are sharing it.
-  **Leecher** - the selfish peers who are downloading the files but not uploading.

<br>
<br>
<br>
<br>

<v-click>

> It is a love based of giving and receiving as well as having and sharing. And the love that they give and have is shared and received. And through this having and giving and sharing and receiving, we too can share and love and have... and receive.  - Joey Tribbiani 

</v-click>

<!--
You can have `style` tag in markdown to override the style for the current page.
Learn more: https://sli.dev/guide/syntax#embedded-styles
-->

<style>
h1 {
  background-color: #2B90B6;
  background-image: linear-gradient(45deg, #4EC5D4 10%, #146b8c 20%);
  background-size: 100%;
  -webkit-background-clip: text;
  -moz-background-clip: text;
  -webkit-text-fill-color: transparent;
  -moz-text-fill-color: transparent;
}
</style>

---

# Selected torrent sites

| Name |  URL   |
| --- | --- |
| 1337x | https://www.1377x.to/ |
| rarbg | https://rarbg.to/ |
| thepiratebay | https://thepiratebay.org/ |
| btdig | https://btdig.com/ |
| debian | https://cdimage.debian.org/debian-cd/current/amd64/bt-cd/ |

<!-- https://sli.dev/guide/animations.html#click-animations -->

---

# Inside a torrent file


```js {all|2|7|9-18|all}
d
  8:announce
    41:http://bttracker.debian.org:6969/announce
  7:comment
    35:"Debian CD from cdimage.debian.org"
  13:creation date
    i1573903810e
  4:info
    d
      6:length
        i351272960e
      4:name
        31:debian-10.2.0-amd64-netinst.iso
      12:piece length
        i262144e
      6:pieces
        26800:�����PS�^�� (binary blob of the hashes of each piece)
    e
e
```


[Parser lib](https://github.com/jackpal/bencode-go)


<!--
Strings come with a length prefix, and look like 4:spam. 

Integers go between start and end markers, so 7 would encode to i7e. 

Lists and dictionaries work in a similar way: l4:spami7ee represents ['spam', 7], while d4:spami7ee means {spam: 7}.
-->

---

# Calling tracker

Request:
```go
func (t *TorrentFile) buildTrackerURL(peerID [20]byte, port uint16) (string, error) {
    base, err := url.Parse(t.Announce)
    if err != nil {
        return "", err
    }
    params := url.Values{
        "info_hash":  []string{string(t.InfoHash[:])},
        "peer_id":    []string{string(peerID[:])},
        "port":       []string{strconv.Itoa(int(Port))},
        "uploaded":   []string{"0"},
        "downloaded": []string{"0"},
        "compact":    []string{"1"},
        "left":       []string{strconv.Itoa(t.Length)},
    }
    base.RawQuery = params.Encode()
    return base.String(), nil
}
```

<!--
Just a get request

info_hash: Identifies the file we’re trying to download. It’s the infohash we calculated earlier from the bencoded info dict. The tracker will use this to figure out which peers to show us.

peer_id: A 20 byte name to identify ourselves to trackers and peers. We’ll just generate 20 random bytes for this.
-->

---

# Calling tracker

Response:
```js
d
  8:interval
    i900e
  5:peers
    252:another long binary blob
e
```

<br>

<img src="/address.png" class="h-60" />

<!--
Interval tells us how often we’re supposed to connect to the tracker again to refresh our list of peers. A value of 900 means we should reconnect every 15 minutes (900 seconds).

Peers is another long binary blob containing the IP addresses of each peer. It’s made out of groups of six bytes. The first four bytes in each group represent the peer’s IP address—each byte represents a number in the IP. The last two bytes represent the port
-->

---

# Calling peers

<img src="/flow.png" class="h-100" />

---
preload: false
---

# Bitfields

<img src="/bitfield.png" class="h-80" />

---

# Bitfields

```go
// A Bitfield represents the pieces that a peer has
type Bitfield []byte

// HasPiece tells if a bitfield has a particular index set
func (bf Bitfield) HasPiece(index int) bool {
    byteIndex := index / 8
    offset := index % 8
    return bf[byteIndex]>>(7-offset)&1 != 0
}

// SetPiece sets a bit in the bitfield
func (bf Bitfield) SetPiece(index int) {
    byteIndex := index / 8
    offset := index % 8
    bf[byteIndex] |= 1 << (7 - offset)
}
```

---
layout: center
class: text-center
---

# Learn More

[Blog](https://blog.jse.li/posts/torrent/) · [GitHub](https://github.com/veggiedefender/torrent-client) · [Paper](https://www.bittorrent.org/bittorrentecon.pdf)
