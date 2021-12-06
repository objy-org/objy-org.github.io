
# Deploy

Any SPOO Platform can be deployed in different architectures and scales.


* 1. Create a platform file (e.g. platform.js)
* 2. Define your platform
* 3. Run the file


#### Example Platform File (platform.js)

```javascript
const SPOO = require('spoo');

SPOO.define({
  name: "user",
  pluralName: "users",
  authable: true
})

SPOO.REST({
  port: 80
}).run()
```


## Command Line

```shell
node platform.js
```


## Docker

> Dockerfile:

```Dockerfile
FROM node:alpine

add platform.js ./
RUN npm i
CMD node platform.js
EXPOSE 80
```

> In your shell:

```shell
docker build -t spoo-platform .
docker run ...
```

## Kubernetes

SPOO can also be deployed on Kubernetes with a SPOO deployment and a corresponding service. 

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: spoo-platform
  labels:
    app: platform
spec:
  selector:
    matchLabels:
      app: platform
  template:
    metadata:
      labels:
        app: platform
    spec:
      containers:
      - name: spoo-platform
        image: REPO...
        ports:
          - name: http
            containerPort: 80
---
apiVersion: v1
kind: Service
metadata:
  name: spoo-platform-service
spec:
  selector:
    app: platform
  ports:
   - protocol: TCP
     port: 80
     targetPort: http
```
