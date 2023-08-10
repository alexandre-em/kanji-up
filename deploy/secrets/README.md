# Kubernetes secrets config

Template to fill with base64 information, for example:

```sh
    cat ~/.docker/config.yaml | base64 | xclip -selection c
```

Then paste it on the template's appropriate section, in this example : `data..dockerconfigjson`

or you can create the secrets manually:

## Docker Hub secret

```sh
    kubectl create secret generic name-of-secret \
        --from-file=.dockerconfigjson=/path/to/.docker/config.json \
        --type=kubernetes.io/dockerconfigjson
```

it will then create a secret : `name-of-secret`, that you can use on the deployment config file.
For example: on `recognition-dep.yaml` file:

```yaml
spec:
  template:
    spec:
      imagePullSecrets:
        - name: name-of-secret
```

In this case, this secret will allow to pull images from private repositories

## Auth secret

```sh
    kubectl create secret generic auth-secret --from-env-file=/path/to/project/back/auth/.env
```

It will create a secret containing all environment variables necessary to run the image, based on an .env file
