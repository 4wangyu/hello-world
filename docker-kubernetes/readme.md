# commands

## create docker image

```sh
docker build -f Dockerfile -t hello-python:latest .
```

## run image

```sh
docker run -dp 5000:5000 hello-python
```

## list all containers

```sh
docker container ls
```

## stop container

```sh
docker container stop ${container_id}
```

## deploy to kubernetes

```sh
kubectl apply -f deployment.yaml
```

## check status

```sh
kubectl get pods

kubectl get deployments

kubectl get services
```
