# Kubernetes deploy

## Local (Without Helm)

Install kubectl and minikube

```sh
    minikube start
    eval $(minikube docker-env)
    docker build -t alexandreem22/recognition
    kubectl create -f k8s.yaml
    kubectl rollout restart deployment kanji-up-dep # To restart if necessary
    minikube service kanji-up-src
```

To stop

```sh
    kubectl delete -n default deployment kanji-up-dep
    kubectl delete -n default service kanji-up-src
    minikube stop
```
