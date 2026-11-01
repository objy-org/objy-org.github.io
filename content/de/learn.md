# OBJY verstehen. :id=learn

Ein Fahrrad, sein Besitzer und die Datenbank dahinter.

## Datenbank :id=database

Die Datenbank-Engine speichert und verarbeitet deine Objekte im Arbeitsspeicher. Sie läuft direkt im Browser und in Node.js. An einem Fahrrad und seinem Besitzer erklären wir zuerst das Datenmodell und danach die interne Speicherung.

### Collections :id=collections

Eine Datenbank enthält benannte Collections. In unserer Datenbank `app` liegen Fahrräder in `bikes` und ihre Besitzer in `people`. Eine Collection gruppiert Objekte und hält Einstellungen wie Indizes und Komprimierung in ihren Metadaten.

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

Ein Objekt beschreibt etwas in deiner Anwendung: ein Fahrrad, eine Person oder eine Buchung. Seine `_id` identifiziert es innerhalb der Collection. Ohne angegebene ID erzeugt OBJY eine. Dieses Fahrrad kombiniert Text, einen Wahrheitswert, eine Zahl und ein Array in einem JSON-Objekt.

Objekte derselben Collection können unterschiedliche Eigenschaften haben. Ein weiteres Fahrrad kann eine Batterie oder einen verschachtelten Standort enthalten, ohne alle vorhandenen Fahrräder zu ändern.

![Ein Fahrradobjekt mit ID, Name, Verfügbarkeit, Preis und Tags.](assets/site/learn/objects.svg)

[Objektmodell](/content/api.md?id=objects)

### Eigenschaften :id=properties

Eigenschaften enthalten deine Daten: Zeichenketten, Zahlen, Wahrheitswerte, Arrays, verschachtelte Objekte oder `null`. Füge das Fahrrad mit `insert` hinzu und ändere einzelne Eigenschaften mit `patch`. Ein Pfad wie `location.city` adressiert eine verschachtelte Eigenschaft.

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

Mit `replace` ersetzt du ein vollständiges Objekt, mit `remove` löschst du es. Die entsprechenden Bulk-Methoden verarbeiten viele Objekte auf einmal.

[Objekte schreiben und ändern](/content/database.md?id=bulk-is-the-native-path)

### Referenzen :id=references

Das Fahrrad gehört Alex. Sein Objekt liegt in `people` und hat die ID `person-42`. Setze die Eigenschaft `owner` auf eine Referenz mit `type`, `collection` und `value`. OBJY speichert die Beziehung und kann beim Lesen die aktuellen Daten des Besitzers auflösen:

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

Das verschachtelte `object` ist die aufgelöste Leseansicht. Ändert sich Alex, können spätere Lesezugriffe auf das Fahrrad die neuen Daten zeigen. Die Referenztiefe bestimmt, wie weit OBJY Beziehungen folgt.

![Das Fahrrad referenziert seinen Besitzer Alex. Beim Lesen enthält owner.object Alex' Daten.](assets/site/learn/references.svg)

[Referenzen speichern und lesen](/content/api.md?id=live-references)

### Abfragen :id=operations

Eine Abfrage findet Objekte anhand ihrer Eigenschaften. Filtere verfügbare Fahrräder, sortiere die Ergebnisse, teile sie in Seiten auf oder berechne Summen und Durchschnittswerte ihrer Preise:

```js
await bikes.find({ available: true });
await bikes.search({
  $aggregate: {
    fields: { averagePrice: { $avg: "price" } }
  }
});
```

Für die Ähnlichkeitssuche liefert deine Anwendung Embeddings in `_vec`. OBJY baut dafür einen Vektorindex auf und durchsucht die Embeddings neben deinen Objektdaten.

![CRUD, Abfragen, Aggregation und Vektorsuche arbeiten mit demselben Fahrradobjekt.](assets/site/learn/apis.svg)

[Abfragen](/content/api.md?id=query) · [Aggregation](/content/api.md?id=aggregation) · [Vektoren](/content/api.md?id=vector-search)

### Speicherung :id=memory

Objekte und ihre Suchstrukturen liegen im RAM. Intern kann OBJY die Eigenschaften eines Objekts auf unterschiedliche Speicherblöcke verteilen und beim Lesen das vollständige Objekt zusammensetzen.

- **Heiße Felder** halten häufig genutzte Eigenschaften direkt zugänglich.
- **Spalten** legen ausgewählte Werte kompakt zusammen ab und beschleunigen Aggregationen.
- **Komprimierte Felder** halten seltener benötigte Objektdaten komprimiert im Arbeitsspeicher und entpacken sie bei Bedarf.

Indizes helfen, passende Objekte zu finden. Gemeinsame Wörterbücher reduzieren wiederholte Werte. Collection-Metadaten steuern diese Strukturen. Diese Konfiguration indiziert die Verfügbarkeit, legt Preise in einer Spalte ab und hält ausgewählte Felder direkt zugänglich, während größere Objektinhalte komprimiert werden:

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

Eingebettete Daten leben so lange wie die Browserseite oder der Node.js-Prozess. Der Server ergänzt gemeinsamen Zugriff und optionale Persistenz, wie im nächsten Kapitel erklärt.

![Die Daten des Fahrrads sind im RAM in heiße Felder, Spalten und komprimierte Felder aufgeteilt.](assets/site/learn/memory.svg)

[Speichereinstellungen](/content/database.md?id=shape-the-workload-with-metadata) · [Arbeitsspeicher und Lebensdauer](/content/database.md?id=memory-is-the-database)

## Server :id=server

Der Server macht dieselbe Datenbank-Engine zu einem gemeinsam nutzbaren Dienst. Er ergänzt das bekannte Objektmodell um Netzwerkzugriff, Authentifizierung, Berechtigungen, Cluster und Wiederherstellung.

### API :id=server-api

Anwendungen verbinden sich über REST oder den JavaScript-Client. Nach Authentifizierung und Berechtigungsprüfung gelangt eine Anfrage zur Datenbank, die das Fahrrad hält. Objekte, Abfragen und Aggregationen funktionieren über dieselbe Schnittstelle.

```http
GET /api/app/bikes/object/bike-01
Authorization: Bearer <accessToken>
```

![Eine Anwendung sendet eine HTTP-Anfrage an den Server. API und Authentifizierung stehen vor der In-Memory-Datenbank.](assets/site/learn/server.svg)

[REST API](/content/api.md) · [JavaScript-Client](/content/client.md)

### Benutzer und Berechtigungen :id=users-permissions

Benutzer melden sich an und erhalten Zugriffstoken. Freigaben für Collections und Regeln für einzelne Objekte bestimmen ihre erlaubten Operationen. Eine Besitzerreferenz beschreibt eine Beziehung; Berechtigungen steuern den Zugriff auf das Fahrrad separat.

Eine Benutzerregel kann zum Beispiel das Lesen und Ändern von Fahrrädern erlauben, deren `owner.value` auf Alex zeigt. Hier steht `r` für Lesen und `u` für Ändern:

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

Ein Cluster verteilt Objekte auf Knoten. Datenbankname, Collection und Objekt-ID bestimmen den Shard eines Objekts. Die Shard-Map legt fest, welche Knoten ihn halten. Jeder öffentliche Knoten kann eine Anfrage annehmen und zum zuständigen Knoten weiterleiten.

- **Sharding** verteilt Daten auf Maschinen. Abfragen und Aggregationen sammeln Ergebnisse aus den benötigten Shards.
- **Replikation** hält zusätzliche Kopien von Shards. Replikate holen Änderungen asynchron ab und holen nach Unterbrechungen auf.

![Zwei Shards liegen auf unterschiedlichen Knoten, mit je einem zusätzlichen Replikat auf einem weiteren Knoten.](assets/site/learn/cluster.svg)

[Cluster einrichten](/content/server.md?id=form-a-cluster) · [Routing und Replikation](/content/server.md?id=route-and-replicate)

### Persistenz :id=persistence

Die laufenden Daten liegen im Arbeitsspeicher. Aktiviere Server-Persistenz, wenn Objekte einen Neustart überstehen sollen:

- **Lokales Write-Ahead-Log:** zeichnet Operationen auf dem Knoten auf. Bei lokaler WAL-Bestätigung und aktiviertem Flush gehört dieser lokale Log-Schritt zu einer erfolgreichen Schreiboperation.
- **Optionaler S3-Speicher:** Journale zeichnen Änderungen auf, Snapshots halten Objektzustände für die Wiederherstellung fest. Uploads laufen asynchron.
- **Wiederherstellung:** Der Server lädt Objekte und spielt neuere Operationen nach. Indizes, Spalten und Vektorindizes werden im Arbeitsspeicher neu aufgebaut.

Replikation und S3-Uploads laufen unabhängig von einer lokalen WAL-Bestätigung. Wähle die Persistenzkonfiguration passend zur benötigten Wiederherstellung deiner Anwendung.

[Persistenz und Wiederherstellung](/content/server.md?id=make-it-durable) · [Loslegen](get-started.md)
