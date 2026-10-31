# Objekte im Mittelpunkt. :id=features

Entdecke die Engine und die Dienste drumherum. Ein Feature nach dem anderen.

## Datenbankkern :id=database-core

Dieselbe Engine in Browser und Node.js. Beispiele nutzen eine vorhandene Collection `items`. [Core-Dokumentation](/content/database.md).

### ![](assets/site/icons/features/flexible-objects.svg) Flexible Objekte :id=flexible-objects

Verschachtelte Eigenschaften, Arrays und unterschiedliche Strukturen in einer Collection. Ohne starres Schema.

```json
{
  "name": "Survey drone",
  "battery": 87,
  "capabilities": ["mapping", "thermal"]
}
```

### ![](assets/site/icons/features/live-references.svg) Live-Referenzen :id=live-references

Verbinde Objekte ohne gespeicherte Kopien. Beim Lesen lässt sich das aktuelle referenzierte Objekt unter `.object` einblenden.

```json
{
  "operator": {
    "type": "reference",
    "collection": "people",
    "value": "person-42"
  }
}
```

### ![](assets/site/icons/features/in-memory.svg) In-Memory-Geschwindigkeit :id=in-memory

Objekte und ihre Indizes liegen im Arbeitsspeicher. Der Kern liest direkt aus dem JavaScript-Heap.

### ![](assets/site/icons/features/hot-compressed.svg) Smarte Komprimierung :id=hot-compressed

Halte häufig genutzte Felder direkt zugänglich. Der Rest wird über Collection-Metadaten komprimiert und beim Lesen entpackt.

```json
{
  "tiering": {
    "mode": "compressedMemory",
    "keep": ["name", "status"]
  }
}
```

### ![](assets/site/icons/features/columns.svg) Kompakte Spalten :id=compact-columns

Speichere ausgewählte Werte in kompakten Spalten für schnelle numerische Aggregationen. Beim Lesen erhältst du vollständige Objekte.

```json
{ "columns": ["score"] }
```

### ![](assets/site/icons/features/shared-values.svg) Gemeinsame Wörterbücher :id=shared-values

Wiederholte Werte teilen sich intern Wörterbucheinträge. Das spart Speicher, ohne deine Objekte zu verändern.

### ![](assets/site/icons/features/metadata.svg) Collection-Metadaten :id=collection-metadata

Lege Indizes, Spalten und Komprimierung pro Collection fest. Deine Objektdaten bleiben davon getrennt.

```json
{
  "indexes": ["status"],
  "columns": ["score"]
}
```

### ![](assets/site/icons/features/vector-search.svg) Vektorsuche :id=vector-search

Bringe eigene Embeddings in `_vec` mit. Durchsuche sie per integriertem HNSW-Index neben deinen Objektdaten.

```js
await items.search({
  $vector: {
    vector: [0.2, 0.8],
    limit: 5
  }
});
```

### ![](assets/site/icons/features/query-aggregate.svg) Abfragen & Aggregationen :id=query-aggregation

Filtere und sortiere Objekte. Gruppiere Daten und berechne Anzahl, Summe oder Durchschnitt mit derselben Engine.

```js
await items.search({
  status: 'active',
  $aggregate: {
    fields: { total: { $sum: 'score' } }
  }
});
```

### ![](assets/site/icons/features/bulk-operations.svg) Bulk-Operationen :id=bulk-operations

Schreibe einzelne Objekte oder Batches über denselben Speicherpfad. Bulk-Operationen gehören direkt zur Engine.

```js
await items.insertMany([
  { _id: 'one', score: 9 },
  { _id: 'two', score: 4 }
]);
```

### ![](assets/site/icons/features/cross-runtime.svg) Browser & Node.js :id=cross-runtime

Bette dieselbe Datenbank-Engine in Browser und Node.js ein. Die API bleibt in beiden Umgebungen gleich.

```js
import { createDatabase } from '@objy/db';
const objy = createDatabase();
```

## DB Server :id=db-server

APIs, Sicherheit und Skalierung rund um den Kern. Client-Beispiele setzen eine authentifizierte Verbindung voraus. [Server-Dokumentation](/content/server.md).

### ![](assets/site/icons/features/rest-client.svg) REST & JavaScript :id=rest-client

Verbinde Apps und Dienste über HTTP, direkt oder mit dem schlanken Paket `@objy/client`.

```js
import { createClient } from '@objy/client';
const client = createClient({
  url: 'http://localhost:8080'
});
```

### ![](assets/site/icons/features/authentication.svg) Benutzer & Anmeldung :id=authentication

Verwalte Benutzer und Sitzungen im Datenbank-Backend. Die Anmeldung erfolgt über eine Collection mit aktivierter Authentifizierung.

```js
await client.login({
  database: 'app',
  username: 'alex',
  password: 'your-password'
});
```

### ![](assets/site/icons/features/permissions.svg) Objektberechtigungen :id=object-permissions

Kombiniere Collection-Rechte, Admin-Rollen und abfragebasierte Objektregeln. Diese Benutzerregel erlaubt Zugriff auf eigene Objekte.

```json
{
  "permissions": [{
    "name": "Own objects",
    "query": { "ownerId": "alex" },
    "perm": "crud"
  }]
}
```

### ![](assets/site/icons/features/files.svg) Dateien als Objekte :id=file-objects

Metadaten liegen im Objekt, die Datei in S3. Dieselben Objektberechtigungen schützen auch die Datei.

```js
await items.insertFile(
  { name: 'notes.txt' },
  new Blob(['Hello OBJY']),
  { filename: 'notes.txt' }
);
```

### ![](assets/site/icons/features/hooks.svg) Hooks für Operationen :id=operation-hooks

Ergänze serverseitig registriertes Verhalten bei Objektoperationen. Aktiviere die registrierten Hooks über Collection-Metadaten.

```json
{
  "hooks": {
    "use": ["audit", "timestamps"]
  }
}
```

### ![](assets/site/icons/features/sharding.svg) Objekt-Sharding :id=object-sharding

Verteile Objekte auf mehrere Maschinen. Anfragen können jeden Knoten erreichen und werden zum zuständigen Shard weitergeleitet.

### ![](assets/site/icons/features/replication.svg) Asynchrone Replikation :id=replication-recovery

Halte Kopien auf anderen Knoten. Replikate holen nach Unterbrechungen wieder auf; die Replikation erfolgt asynchron.

### ![](assets/site/icons/features/s3-durability.svg) Optionale S3-Persistenz :id=s3-durability

Ergänze lokales Write-Ahead-Log, S3-Journale und Snapshots für Persistenz und Wiederherstellung. Aktiviere sie bei Bedarf für dein Deployment.

### ![](assets/site/icons/features/streaming-import.svg) Streaming-Importe :id=streaming-import

Streame NDJSON in begrenzten Batches. Importiere ein Iterable, ohne vorher ein riesiges Array im Speicher aufzubauen.

```js
await items.import(async function* () {
  yield { _id: 'one', score: 9 };
  yield { _id: 'two', score: 4 };
});
```

### ![](assets/site/icons/features/cluster-console.svg) Cluster-Konsole :id=cluster-console

Behalte Speicher, Replikation, Betriebsbereitschaft und Topologie in der Administrationskonsole des Servers im Blick.
