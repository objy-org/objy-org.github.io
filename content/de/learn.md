# OBJY verstehen. :id=learn

Starte mit einem Fahrrad. Verbinde seinen Besitzer. Baue darauf auf.

## ![](assets/site/icons/database.svg) Datenbank :id=database

**Objekte im Arbeitsspeicher des Servers.** Deine Anwendung verbindet sich über REST oder `@objy/client`. Datenbanken und Collections organisieren die JSON-Objekte.

### Collections :id=collections

Erstelle die Datenbank `app` und gruppiere zusammengehörige Objekte: Fahrräder in `bikes`, Besitzer in `people`. Jede Collection hat eigene Einstellungen für Indizes und Speicherung.

![Die Datenbank app verzweigt sich in die Collections bikes und people. Beide enthalten eigenständige JSON-Objekte.](assets/site/learn/collections.svg)

<details>
<summary>Datenbank und Collections anlegen</summary>

Installiere den Client mit `npm install @objy/client` und verbinde dich mit einem laufenden Server. Nutze das von der CLI ausgegebene Administratorpasswort und einen neuen Datenbanknamen. Die folgenden Beispiele verwenden `app` und `bikes` weiter.

```js
import { createClient } from "@objy/client";

const client = createClient({ url: "http://localhost:8080" });
await client.login({ username: "admin", password: "<printed-password>" });

await client.createDatabase("app");
const app = client.database("app");
await app.createCollection("bikes");
await app.createCollection("people");
const bikes = app.collection("bikes");
```

</details>

[Datenbank einrichten](/content/api.md?id=databases)

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

[Schreiboperationen](/content/api.md?id=bulk-objects)

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
// The server returns 503 while its vector index is warming. Retry then.
const similar = await bikes.search({
  $vector: { vector: [0.21, 0.79, 0.4], limit: 3 }
});
```

</details>

Nutze dasselbe Embedding-Modell für Objekte und Abfragen. Die kurzen Vektoren dienen als Beispiel. Wiederhole die Suche, wenn der Server beim Aufbau des Vektorindex `503` zurückgibt.

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

Der Server hält Objekte im Arbeitsspeicher. Indizes und Spalten können im Hintergrund entstehen; die Persistenzeinstellungen bestimmen die Wiederherstellung nach einem Neustart.

[Speicherung und Indizes](/content/api.md?id=collections)

## ![](assets/site/icons/server.svg) Server :id=server

**Ein gemeinsamer Datenbankdienst.** `@objy/server` betreibt Datenbankkern, HTTP-API, Benutzer, Berechtigungen, Clustering und Persistenz zusammen.

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

Auch Benutzer sind Objekte. Die Anmeldung liefert ein Token; der Server prüft dessen Berechtigungen bei jeder Operation.

- **Objekte auswählen** mit einer `query`, etwa Alex' ID in `owner.value`.
- **Aktionen festlegen** mit `perm`: `c` Erstellen, `r` Lesen, `u` Ändern, `d` Löschen.
- **Ganze Collections freigeben** mit `read`- und `write`-Freigaben.

Für normale Benutzer gilt: Ohne passende Regel oder Freigabe gibt es keinen Zugriff. Eine Referenz allein gewährt keinen Zugriff.

![Alex' Regel zum Lesen und Ändern prüft die Besitzerreferenz des Fahrrads. Sein Fahrrad darf er lesen und ändern, das eines anderen Besitzers nicht.](assets/site/learn/permissions.svg)

<details>
<summary>Alex anlegen und anmelden</summary>

Wenn die Datenbank `app` bereits eingerichtet ist, legt ein Administrator Alex in `app/users` an. Die Regel nutzt seine Profil-ID `person-42` aus der Besitzerreferenz des Fahrrads. Passwörter werden beim Schreiben gehasht.

```http
POST /api/app/users/object
Authorization: Bearer <adminAccessToken>
Content-Type: application/json

{
  "_id": "alex",
  "username": "alex",
  "password": "<alex-password>",
  "permissions": [
    {
      "name": "My bikes",
      "query": { "owner.value": "person-42" },
      "perm": "ru"
    }
  ]
}
```

Danach meldet sich Alex an. Das zurückgegebene `accessToken` wird in den nächsten Beispielen als `<alexAccessToken>` verwendet. Diese Anmeldung begrenzt seinen Zugriff auf `app`.

```http
POST /api/app/users/auth
Content-Type: application/json

{ "username": "alex", "password": "<alex-password>" }
```

</details>

<details>
<summary>Was Alex lesen und ändern darf</summary>

Alex fragt nach verfügbaren Fahrrädern. Der Server kombiniert seinen Filter mit der Leseregel: Er sieht nur verfügbare Fahrräder mit `person-42` in `owner.value`.

Um `owner.object` aufzulösen, braucht Alex auch Lesezugriff auf die Person. Diese Anfragen verwenden `$refDepth: 0`, um nur die Referenz zurückzugeben.

```http
POST /api/app/bikes/search
Authorization: Bearer <alexAccessToken>
Content-Type: application/json

{ "available": true, "$refDepth": 0 }
```

Wenn `bike-01` Alex gehört, darf er den Preis ändern:

```http
PATCH /api/app/bikes/object/bike-01?$refDepth=0
Authorization: Bearer <alexAccessToken>
Content-Type: application/json

{ "$set": { "price": 20 } }
```

| Operation mit dieser `ru`-Regel | Ergebnis |
| --- | --- |
| Alex' Fahrrad lesen oder ändern | Erlaubt |
| Das Fahrrad eines anderen Besitzers lesen oder ändern | Verweigert |
| `owner.value` auf die ID eines anderen Besitzers ändern | Verweigert: Änderungen müssen vor und nach der Operation zur Regel passen |
| Ein Fahrrad erstellen oder Alex' Fahrrad löschen | Verweigert: Der Regel fehlen `c` und `d` |

Derselbe Lesefilter begrenzt auch Abfragen, Aggregationen und Vektorsuchen. Sie umgehen die Berechtigungen nicht.

</details>

<details>
<summary>Zugriff erweitern</summary>

Damit Alex passende Objekte auch erstellen und löschen darf, ändert ein Administrator seine Regel auf `crud`:

```http
PATCH /api/app/users/object/alex
Authorization: Bearer <adminAccessToken>
Content-Type: application/json

{
  "$set": {
    "permissions": [
      {
        "name": "My bikes",
        "query": { "owner.value": "person-42" },
        "perm": "crud"
      }
    ]
  }
}
```

Für Zugriff auf jedes Fahrrad gibt es Collection-Freigaben. Diese ergänzt Lesezugriff auf die ganze Collection, ohne eine umfassende Schreibfreigabe zu vergeben:

```json
{
  "collectionPermissions": {
    "read": ["bikes"],
    "write": []
  }
}
```

Diese Felder werden auf dem Benutzerobjekt gespeichert. Eine `write`-Freigabe erlaubt Erstellen, Ändern und Löschen in der ganzen Collection; sie schließt `read` nicht ein.

Weitere Einträge in `permissions` können andere Objektgruppen freigeben. Regeln und Freigaben addieren Zugriff: Eine umfassende Freigabe wird durch eine Objektregel nicht eingeschränkt.

Nach einer Änderung der Berechtigungen muss sich Alex erneut anmelden oder sein Token erneuern, um die neuen Berechtigungen zu erhalten.

</details>

[Authentifizierung](/content/api.md?id=authentication) · [Berechtigungen](/content/api.md?id=permissions)

### Cluster :id=clusters

Über eine Maschine hinaus wachsen, mit zwei unterschiedlichen Bausteinen:

- **Shards** verteilen die Objekte auf Knoten.
- **Replikate** halten zusätzliche Kopien eines Shards auf anderen Knoten.

Anfragen können jeden öffentlichen Knoten erreichen; das Routing findet den zuständigen Besitzer. Replikate werden asynchron aktualisiert.

![Zwei Objekt-Shards liegen auf unterschiedlichen Maschinen, jeweils mit einem zusätzlichen Replikat auf einer weiteren Maschine.](assets/site/learn/cluster.svg)

[Cluster einrichten](/content/server.md?id=configuration)

### Persistenz :id=persistence

Entscheide, was einen Neustart übersteht:

- **Lokales WAL** protokolliert Schreibvorgänge auf dem Knoten. Bei `localWal` folgt die Bestätigung auf den lokalen Flush.
- **Optionales S3** hält Journale und Snapshots asynchron vor.
- **Wiederherstellung** lädt Objekte und baut Indizes im RAM neu auf.

Eine lokale WAL-Bestätigung wartet weder auf Replikate noch auf S3-Uploads.

[Persistenzeinstellungen](/content/server.md?id=configuration) · [OBJY starten](get-started.md)
