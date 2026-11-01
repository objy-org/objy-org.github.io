# OBJY verstehen. :id=learn

Ein Fahrrad, sein Besitzer und die Datenbank dahinter.

## ![](assets/site/icons/database.svg) Datenbank :id=database

Arbeite mit JSON-Objekten direkt im Arbeitsspeicher, im Browser und in Node.js.

### Collections :id=collections

Collections gruppieren Objekte: `bikes` für Fahrräder, `people` für Besitzer. Ihre Metadaten steuern Indizes und Speicherung.

```js
import { createDatabase } from "@objy/db";
const objy = createDatabase();
await objy.createDatabase("app");
const app = objy.database("app");
await app.createCollection("bikes");
await app.createCollection("people");
const bikes = app.collection("bikes");
```

![Die Collection bikes enthält ein Fahrrad und weitere Objekte mit gemeinsamen Einstellungen für Indizes, Spalten und Komprimierung.](assets/site/learn/collections.svg)

[Datenbank einrichten](/content/database.md?id=use-the-same-database-api)

### Objekte :id=objects

Objekte beschreiben Dinge in deiner App. Jedes hat eine eindeutige `_id` innerhalb seiner Collection; bei Bedarf erzeugt OBJY sie. Die Eigenschaften dürfen sich unterscheiden, ohne festes Schema.

![Ein Fahrradobjekt mit ID, Name, Verfügbarkeit, Preis und Tags.](assets/site/learn/objects.svg)

[Objektmodell](/content/api.md?id=objects)

### Eigenschaften :id=properties

Speichere Text, Zahlen, Wahrheitswerte, Arrays, verschachtelte Objekte oder `null`. Mit `insert` fügst du ein Objekt hinzu, mit `patch` änderst du Felder.

```js
await bikes.insert({
  _id: "bike-01",
  name: "City bike",
  available: true,
  price: 15,
  tags: ["city", "electric"]
});
await bikes.patch("bike-01", {
  $set: { "location.city": "Berlin" }
});
```

Punktpfade ändern verschachtelte Felder. `replace` ersetzt ein Objekt, `remove` löscht es. Bulk-Methoden verarbeiten viele Objekte.

[Objekte schreiben und ändern](/content/database.md?id=bulk-is-the-native-path)

### Referenzen :id=references

Der `owner` des Fahrrads zeigt auf Alex in `people`. Beim Auflösen erscheinen seine aktuellen Daten unter `owner.object`:

```json
{
  "_id": "bike-01",
  "owner": {
    "type": "reference",
    "collection": "people",
    "value": "person-42",
    "object": { "_id": "person-42", "name": "Alex" }
  }
}
```

Gespeichert werden `type`, `collection` und `value`; `object` ist die aufgelöste Leseansicht. Spätere Lesezugriffe können Alex’ Änderungen zeigen. Die Referenztiefe begrenzt, wie weit OBJY Beziehungen folgt.

![Das Fahrrad referenziert seinen Besitzer Alex. Beim Lesen enthält owner.object Alex' Daten.](assets/site/learn/references.svg)

[Referenzen speichern und lesen](/content/api.md?id=live-references)

### Abfragen :id=operations

Finde verfügbare Fahrräder oder berechne ihren Durchschnittspreis. Abfragen unterstützen auch Sortierung und Seiteneinteilung:

```js
await bikes.find({ available: true });
await bikes.search({
  $aggregate: {
    fields: { averagePrice: { $avg: "price" } }
  }
});
```

![CRUD, Abfragen, Aggregation und Vektorsuche arbeiten mit demselben Fahrradobjekt.](assets/site/learn/apis.svg)

[Abfragen](/content/api.md?id=query) · [Aggregation](/content/api.md?id=aggregation) · [Vektoren](/content/api.md?id=vector-search)

### Vektoren und HNSW :id=vectors

Ein Vektor beschreibt Merkmale als Zahlen. Speichere ein Embedding in `_vec`, um ähnliche Objekte zu finden. Deine App erzeugt Embeddings aus Text, Bildern oder anderen Daten.

**HNSW** durchsucht einen Graphen mit mehreren Ebenen im RAM: erst große Sprünge, dann nahe Treffer. So findet OBJY schnell näherungsweise die nächsten Nachbarn.

```js
await bikes.patch("bike-01", {
  $set: { _vec: [0.2, 0.8, 0.4] }
});
await bikes.ready();
const similar = await bikes.search({
  $vector: {
    vector: [0.21, 0.79, 0.4],
    limit: 3
  }
});
```

Die kurzen Vektoren dienen als Beispiel. Nutze dasselbe Embedding-Modell für Daten und Suche. `ready()` wartet auf den Index; Ergebnisse enthalten den Ähnlichkeitswert `_score`.

![Eine Suchanfrage folgt einer hervorgehobenen Route durch drei HNSW-Graphebenen. Wenige obere Verbindungen führen in eine dichtere Nachbarschaft von Fahrradvektoren und schließlich zu ähnlichen Fahrrädern.](assets/site/learn/vectors.svg)

[Vektorsuche-API](/content/api.md?id=vector-search) · [HNSW-Hintergrund](https://arxiv.org/abs/1603.09320)

### Speicherung :id=memory

Objekte liegen im RAM. OBJY verteilt ihre Felder intern auf Speicherblöcke und setzt beim Lesen vollständige Objekte zusammen.

- **Heiße Felder:** direkter Zugriff auf häufig genutzte Daten.
- **Spalten:** kompakte Werte für schnelle Aggregationen.
- **Komprimierte Felder:** weniger Speicher für seltener genutzte Daten.

Collection-Metadaten bestimmen, welche Felder indiziert, als Spalten gespeichert oder direkt zugänglich bleiben:

```json
{
  "indexes": ["available"],
  "columns": ["price"],
  "tiering": {
    "mode": "compressedMemory",
    "keep": ["name", "available"]
  }
}
```

Eingebettete Daten bleiben bis zum Schließen der Seite oder des Prozesses erhalten. Der Server ergänzt optionale Persistenz für Neustarts.

![Die Daten des Fahrrads sind im RAM in heiße Felder, Spalten und komprimierte Felder aufgeteilt.](assets/site/learn/memory.svg)

[Speichereinstellungen](/content/database.md?id=shape-the-workload-with-metadata) · [Arbeitsspeicher und Lebensdauer](/content/database.md?id=memory-is-the-database)

## ![](assets/site/icons/server.svg) Server :id=server

Nutze die Datenbank gemeinsam über ein Netzwerk, mit Authentifizierung, Berechtigungen, Clustering und optionaler Persistenz.

### API :id=server-api

Verbinde dich über REST oder den JavaScript-Client. Der Server prüft den Zugriff, bevor er Objektoperationen ausführt.

```http
GET /api/app/bikes/object/bike-01
Authorization: Bearer <accessToken>
```

![Eine Anwendung sendet eine HTTP-Anfrage an den Server. API und Authentifizierung stehen vor der In-Memory-Datenbank.](assets/site/learn/server.svg)

[REST API](/content/api.md) · [JavaScript-Client](/content/client.md)

### Benutzer und Berechtigungen :id=users-permissions

Benutzer erhalten beim Anmelden Zugriffstoken. Collection-Freigaben und Objektregeln steuern den Zugriff; eine Besitzerreferenz allein gewährt keine Rechte.

Diese Benutzerregel erlaubt das Lesen (`r`) und Ändern (`u`) von Alex’ Fahrrädern:

```json
{
  "permissions": [
    {
      "query": { "owner.value": "person-42" },
      "perm": "ru"
    }
  ]
}
```

[Authentifizierung und Berechtigungen](/content/api.md?id=authentication-and-permissions)

### Cluster :id=clusters

Ein Cluster verteilt Daten auf Knoten und leitet Anfragen an den Knoten weiter, der das Objekt hält.

- **Sharding:** verteilt Daten auf Maschinen; Abfragen führen Ergebnisse der benötigten Shards zusammen.
- **Replikation:** hält zusätzliche Kopien, die asynchron aktualisiert werden.

![Zwei Shards liegen auf unterschiedlichen Knoten, mit je einem zusätzlichen Replikat auf einem weiteren Knoten.](assets/site/learn/cluster.svg)

[Cluster einrichten](/content/server.md?id=form-a-cluster) · [Routing und Replikation](/content/server.md?id=route-and-replicate)

### Persistenz :id=persistence

Aktiviere Persistenz, um Daten nach einem Neustart wiederherzustellen:

- **Lokales WAL:** protokolliert Schreibvorgänge auf dem Knoten; die Bestätigung hängt von der Konfiguration ab.
- **Optionales S3:** speichert Journale und Snapshots. Uploads laufen asynchron.
- **Wiederherstellung:** lädt Objekte und baut Indizes im RAM neu auf.

Eine lokale WAL-Bestätigung wartet weder auf Replikation noch auf S3-Uploads.

[Persistenz und Wiederherstellung](/content/server.md?id=make-it-durable) · [Loslegen](get-started.md)
