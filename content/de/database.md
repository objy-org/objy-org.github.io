# objy.db

objy.db ist eine In-Memory-Datenbank für dynamische Objekte mit Sharding und Replikation. Objekte können unterschiedlich aufgebaut sein, in Collections liegen und über Verweise miteinander verbunden werden.

[Zurück zur Website](/?id=top)

## Abstrakte Objekte :id=abstract-objects

Jedes Objekt hat eine eindeutige `_id`. Die übrigen Eigenschaften können Zeichenketten, Zahlen, boolesche Werte, Arrays, verschachtelte Objekte oder `null` enthalten. Collections benötigen vor dem Einfügen kein festes Schema.

```json
{
  "_id": "bike-001",
  "color": "coral",
  "available": true,
  "owner": {
    "type": "reference",
    "collection": "people",
    "value": "person-001"
  }
}
```

Verweise speichern die Ziel-Collection und die Objekt-ID. Beim Lesen lassen sie sich auflösen, sodass verknüpfte Objekte mit zurückgegeben werden.

Collection-Hooks ermöglichen serverseitig registrierte Validierungen, Transformationen und weiteres Verhalten rund um öffentliche Erstell-, Lese-, Änderungs- und Löschoperationen. Optionale Erweiterungen ergänzen Vererbung und Lebenszyklus-Aktionen. Zeitgesteuerte Ereignisse benötigen einen separaten Scheduler; sie sind keine automatische Funktion des Datenbankkerns.

## Arbeitsspeicher, Kompression und Spalten :id=memory-compression-and-columns

Objekte und Indizes liegen im Arbeitsspeicher. Die Metadaten einer Collection legen fest, welche Felder indiziert, in Spalten abgelegt oder komprimiert werden:

```json
{
  "indexes": ["status"],
  "columns": ["score"],
  "tiering": {
    "mode": "compressedMemory",
    "keep": ["name", "status"],
    "minBytes": 4096
  }
}
```

- `indexes` grenzen die infrage kommenden Objekte für Filter und unterstützte Sortierungen ein.
- `columns` speichern ausgewählte Werte in kompakten Spalten. So müssen Aggregationsabfragen nicht immer vollständige Objekte lesen.
- `tiering` komprimiert seltener genutzte Felder im Arbeitsspeicher. Mit `keep` wählst du Felder aus, die unkomprimiert bleiben; mit `offload` diejenigen, die komprimiert werden. Verwende nicht beides gleichzeitig.

Indizierte Felder und Spaltenfelder bleiben automatisch unkomprimiert. Lesezugriffe liefern weiterhin vollständige Objekte. Abfragen auf nicht indizierten, komprimierten Feldern können beim Scan eine Dekompression erfordern.

## Persistenz :id=persistence

S3-kompatibler Speicher hält Journale und Snapshots vor. Beim Start stellen Knoten Snapshots wieder her, spielen neuere Journale ein und bauen Indizes erneut auf.

Die Bestätigung von Schreibzugriffen ist konfigurierbar. Eine Speicherbestätigung bestätigt die Annahme im RAM. Eine lokale WAL-Bestätigung wartet, bis das lokale Write-ahead-Log geschrieben wurde. Richte Persistenz und Replikation nach den Wiederherstellungsgarantien aus, die deine Anwendung benötigt.

## Einen Knoten starten :id=run-a-node

Aus einem lokalen Checkout des Datenbank-Quellcodes mit installiertem Node.js:

```sh
npm ci
node src/index.js --config spread-db.config.json --node node-a --url http://localhost:8080 --port 8080
```

Die Datenbankkonsole ist unter der Basis-URL des Knotens erreichbar. Verwende die Konfigurationsbeispiele im Datenbank-Repository für Speicher- und Cluster-Einstellungen. Das Repository enthält auch ein Dockerfile für den Betrieb in Containern.

## Einen Cluster bereitstellen :id=deploy-a-cluster

Starte objy.db als Node.js-Prozess oder Docker-Container auf geeigneten lokalen Rechnern, virtuellen Maschinen, eigener Infrastruktur oder Cloud-Servern. Für dauerhafte Speicherung muss S3-kompatibler Speicher erreichbar sein. Bei aktiviertem WAL wird außerdem das konfigurierte lokale WAL-Verzeichnis benötigt.

Eine gemeinsame Shard-Zuordnung verteilt Objekte auf Shards. Jeder Shard hat ein oder mehrere Replikate. Knoten leiten Anfragen an den zuständigen Shard weiter; Replikate synchronisieren sich asynchron. Shards erhöhen die logische Kapazität. Replikate erzeugen zusätzliche Kopien und benötigen weiteren physischen Arbeitsspeicher.

Änderungen an der Topologie sind geplante Vorgänge. Die Deployment-Werkzeuge unterstützen einen Wartungsablauf: Datenverkehr anhalten, Topologie anpassen, Daten in die neue Shard-Struktur wiederherstellen, Betriebsbereitschaft prüfen und den Datenverkehr wieder freigeben. Das ist keine automatische Skalierung ohne Ausfallzeit.

## Clients und APIs :id=clients-and-apis

Die Datenbank stellt eine HTTP-API bereit. Objekt-Routen haben diese Form:

```text
/api/{database}/{collection}/object/{id}
```

Die Datenbank enthält außerdem einen JavaScript-Client unter `/client.js` für Browser-Imports und `objydb/client` für Node.js-Anwendungen. Die Admin-Konsole bietet Zugriff auf Objekte, Metadaten, Indizes und den Cluster-Status.
