# Local servers :id=deploy-run

Start with one node, or run a local cluster.

## Install :id=install-server

```sh
npm install --global @objy/cli
```

## One node :id=deploy-quick-start

```sh
objy deploy local --name dev --size tiny
objy status dev
```

[Server guide](/content/server.md?id=run-the-server)

## Cluster :id=deploy-cluster

```sh
objy deploy local --name dev-cluster --size custom --shards 2 --replicas 2 --memory 2048
objy status dev-cluster
```

[Cluster setup](/content/server.md?id=configuration)
