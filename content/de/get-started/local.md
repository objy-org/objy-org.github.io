# Lokale Server :id=deploy-run

Starte mit einem Knoten oder betreibe einen lokalen Cluster.

## Installation :id=install-server

```sh
npm install --global @objy/cli
```

## Ein Knoten :id=deploy-quick-start

```sh
objy deploy local --name dev --size tiny
objy status dev
```

[Server-Anleitung](/content/server.md?id=run-the-server)

## Cluster :id=deploy-cluster

```sh
objy deploy local --name dev-cluster --size custom --shards 2 --replicas 2 --memory 2048
objy status dev-cluster
```

[Cluster einrichten](/content/server.md?id=configuration)
