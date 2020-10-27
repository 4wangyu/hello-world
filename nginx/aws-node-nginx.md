# To setup nginx as proxy for nodejs server on AWS Ubuntu instance

```
$ sudo apt-get install nginx -y  # To install nginx

$ sudo systemctl status nginx    # To check the status of nginx

$ sudo systemctl start nginx     # To start nginx

$ sudo systemctl enable nginx    # To start nginx on system startup

$ sudo rm /etc/nginx/sites-available/default    # To remove existing config

$ sudo vi /etc/nginx/sites-available/default    # To edit new config

Paste below to default config file:
server {
   listen         80 default_server;
   listen         [::]:80 default_server;
   server_name    localhost;
   root           /usr/share/nginx/html;

   location / {
       proxy_pass http://127.0.0.1:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
}

$ sudo nginx -t    # To test nginx config

$ sudo /etc/init.d/nginx reload    # To reload nginx

$ sudo service nginx restart    # To restart nginx
```

_Note: Don't forget to edit inbound rules to make above work_
