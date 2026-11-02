# Local servers :id=deploy-run

Start with one node, or run a local cluster.

## Install :id=install-server

```sh
npm i -g @objy/server
```

## One node :id=deploy-quick-start

```sh
objy run
```

[Quick-start guide](/content/server.md?id=start-one-node)

## Cluster :id=deploy-cluster

```sh
objy start --instances 4
objy status
```

[Cluster setup](/content/server.md?id=form-a-cluster)
