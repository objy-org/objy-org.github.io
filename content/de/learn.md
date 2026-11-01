# OBJY verstehen. :id=learn

Starte mit einem Fahrrad. Verbinde seinen Besitzer. Baue darauf auf.

## ![](assets/site/icons/database.svg) Datenbank :id=database

**Direkt in deiner Anwendung.** `@objy/db` läuft im Browser oder in deinem Node.js-Prozess. Du arbeitest mit Collections von JSON-Objekten, direkt im Arbeitsspeicher.

### Collections :id=collections

Erstelle die Datenbank `app` und gruppiere zusammengehörige Objekte: Fahrräder in `bikes`, Besitzer in `people`. Jede Collection hat eigene Einstellungen für Indizes und Speicherung.

![Die Datenbank app verzweigt sich in die Collections bikes und people. Beide enthalten eigenständige JSON-Objekte.](assets/site/learn/collections.svg)

<details>
<summary>Datenbank und Collections anlegen</summary>

```js
import { createDatabase } from "@objy/db";
const objy = createDatabase();
await objy.createDatabase("app");
const app = objy.database("app");
await app.createCollection("bikes");
await app.createCollection("people");
const bikes = app.collection("bikes");
```

</details>

[Datenbank einrichten](/content/database.md?id=use-the-same-database-api)

### Objekte :id=objects

Ein Fahrrad ist ein Objekt mit einer `_id` und deinen eigenen Eigenschaften. Die ID ist innerhalb der Collection eindeutig; bei Bedarf erzeugt OBJY sie.

Zahlen, Wahrheitswerte, Arrays und verschachtelte Objekte behalten ihren Typ. Objekte derselben Collection dürfen unterschiedliche Eigenschaften haben.

![Ein einfaches JSON-Fahrradobjekt: Die ID identifiziert es, seine Eigenschaften beschreiben es.](assets/site/learn/objects.svg)

[Objektmodell](/content/api.md?id=objects)

### Eigenschaften :id=properties

Füge das Fahrrad ein und ändere anschließend nur seinen Standort. `$set` unterstützt Punktpfade für verschachtelte Felder; `$unset` entfernt eine Eigenschaft.

```js
await bikes.insert({
  _id: "bike-01", name: "City bike",
  available: true, price: 15
});
await bikes.patch("bike-01", {
  $set: { "location.city": "Berlin" }
});
```

Mit `replace` ersetzt du das ganze Objekt, mit `remove` löschst du es. Bulk-Methoden verarbeiten viele Objekte.

[Schreiboperationen](/content/database.md?id=bulk-is-the-native-path)

### Referenzen :id=references

Der `owner` des Fahrrads zeigt auf Alex in `people`. Gespeichert werden die Collection und ID des Ziels. Beim Lesen löst OBJY die Referenz unter `owner.object` in Alex’ aktuelle Daten auf.

![Das Fahrrad enthält eine owner-Referenz. Unter object erscheinen Alex’ Daten aus der separaten Collection people; das blasse Alex-Objekt zeigt die Quelle.](assets/site/learn/references.svg)

<details>
<summary>Das Fahrrad mit Alex verbinden</summary>

```js
await app.collection("people").insert({
  _id: "person-42", name: "Alex"
});
await bikes.patch("bike-01", {
  $set: { owner: {
    type: "reference",
    collection: "people",
    value: "person-42"
  } }
});
```

</details>

`owner.object` ist die aufgelöste Ansicht. Die Referenz zeigt weiterhin auf Alex, wenn sich seine Daten ändern.

[Referenzen und Lesetiefe](/content/api.md?id=live-references)

### Erstellen, Lesen, Ändern, Löschen :id=crud

Alle vier Operationen arbeiten auf derselben Collection. Dieses Beispiel legt ein zweites Fahrrad an, liest es über seine ID, ändert den Preis und löscht es anschließend.

```js
// Create
await bikes.insert({
  _id: "bike-02",
  name: "Cargo bike",
  price: 25
});

// Read
await bikes.find({ _id: "bike-02" });

// Update
await bikes.patch("bike-02", {
  $set: { price: 30 }
});

// Delete
await bikes.remove("bike-02");
```

### Abfragen :id=operations

Finde verfügbare Fahrräder oder berechne ihren Durchschnittspreis. Die erste Operation liefert Objekte, die zweite berechnet ein Ergebnis über diese Objekte.

```js
await bikes.find({ available: true });

await bikes.search({
  available: true,
  $aggregate: {
    fields: { averagePrice: { $avg: "price" } }
  }
});
```

[Filter und Sortierung](/content/api.md?id=query) · [Aggregation](/content/api.md?id=aggregation)

### Vektoren und HNSW :id=vectors

Finde Fahrräder mit ähnlichen Merkmalen. Deine App erzeugt ein Embedding und speichert dessen Zahlen unter `_vec`.

Der **HNSW-Index** durchsucht einen Graphen im RAM: Große Sprünge grenzen den Bereich ein, nahe Verbindungen führen zu ähnlichen Objekten.

![Eine hervorgehobene Suche springt durch dünn vernetzte HNSW-Ebenen und erkundet anschließend benachbarte Fahrradvektoren.](assets/site/learn/vectors.svg)

<details>
<summary>Vektor speichern und ähnliche Fahrräder finden</summary>

```js
await bikes.patch("bike-01", {
  $set: { _vec: [0.2, 0.8, 0.4] }
});
await bikes.ready();
const similar = await bikes.search({
  $vector: { vector: [0.21, 0.79, 0.4], limit: 3 }
});
```

</details>

Nutze dasselbe Embedding-Modell für Objekte und Abfragen. Die kurzen Vektoren oben dienen als Beispiel; `ready()` wartet auf den Index.

[Vektorsuche](/content/api.md?id=vector-search)

### Speicherung :id=memory

Du liest vollständige Objekte. Collection-Metadaten bestimmen intern, wie ihre Felder den Arbeitsspeicher nutzen:

- **Heiße Felder:** häufig gelesene Werte bleiben direkt zugänglich.
- **Spalten:** Werte wie `price` werden kompakt für Aggregationen gespeichert.
- **Komprimierung:** seltener benötigte Objektdaten brauchen weniger Platz.

![Ein einfaches Fahrradobjekt fließt in einen RAM-Riegel mit heißen Feldern, kompakten Spalten und komprimierten Daten.](assets/site/learn/memory.svg)

<details>
<summary>Indizes und Speichereinstellungen wählen</summary>

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

</details>

Schreibvorgänge sind sofort sichtbar. Indizes und Spalten können im Hintergrund fertig aufgebaut werden. Eingebettete Daten leben so lange wie die Seite oder der Prozess.

[Speicherung und Indizes](/content/database.md?id=shape-the-workload-with-metadata)

## ![](assets/site/icons/server.svg) Server :id=server

**Gemeinsam für deine Anwendungen.** `@objy/server` ergänzt denselben Datenbankkern um Netzwerkzugriff, Benutzer, Berechtigungen, Clustering und Persistenz.

### API :id=server-api

Deine App sendet eine Anfrage über REST oder den JavaScript-Client. Der Server prüft Token und Berechtigungen und führt die Operation auf der Datenbank aus.

![Eine Anwendung schickt eine Anfrage durch API und Zugriffsprüfung an denselben In-Memory-Datenbankkern.](assets/site/learn/server.svg)

<details>
<summary>Das Fahrrad über REST lesen</summary>

```http
GET /api/app/bikes/object/bike-01
Authorization: Bearer <accessToken>
```

</details>

[REST API](/content/api.md) · [JavaScript-Client](/content/client.md)

### Benutzer und Berechtigungen :id=users-permissions

Beim Anmelden erhält ein Benutzer ein Zugriffstoken. Collection-Freigaben und Objektregeln bestimmen, welche Daten er nutzen darf.

Diese Regel erlaubt Alex, Fahrräder mit seiner ID in `owner.value` zu lesen (`r`) und zu ändern (`u`). Eine Referenz allein gewährt keinen Zugriff.

```json
{
  "permissions": [{
    "query": { "owner.value": "person-42" },
    "perm": "ru"
  }]
}
```

[Authentifizierung und Berechtigungen](/content/api.md?id=authentication-and-permissions)

### Cluster :id=clusters

Über eine Maschine hinaus wachsen, mit zwei unterschiedlichen Bausteinen:

- **Shards** verteilen die Objekte auf Knoten.
- **Replikate** halten zusätzliche Kopien eines Shards auf anderen Knoten.

Anfragen können jeden öffentlichen Knoten erreichen; das Routing findet den zuständigen Besitzer. Replikate werden asynchron aktualisiert.

![Zwei Objekt-Shards liegen auf unterschiedlichen Maschinen, jeweils mit einem zusätzlichen Replikat auf einer weiteren Maschine.](assets/site/learn/cluster.svg)

[Cluster einrichten](/content/server.md?id=form-a-cluster)

### Persistenz :id=persistence

Entscheide, was einen Neustart übersteht:

- **Lokales WAL** protokolliert Schreibvorgänge auf dem Knoten. Bei `localWal` folgt die Bestätigung auf den lokalen Flush.
- **Optionales S3** hält Journale und Snapshots asynchron vor.
- **Wiederherstellung** lädt Objekte und baut Indizes im RAM neu auf.

Eine lokale WAL-Bestätigung wartet weder auf Replikate noch auf S3-Uploads.

[Persistenzeinstellungen](/content/server.md?id=make-it-durable) · [OBJY starten](get-started.md)
