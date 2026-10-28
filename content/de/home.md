<!-- Texte und Bilder in Markdown bearbeiten. Alle :id=... unverändert lassen. -->

# Schnelle, hochskalierbare<br> In-Memory-Objektdatenbank. :id=top

> Baue Anwendungsfälle rund um schnelle Objekte.

Flexibles JSON. Live-Referenzen. Effiziente Speicherung.\
Baue deine Anwendung auf OBJY – mit integrierter API, Authentifizierung, Benutzerverwaltung und Berechtigungen.

![Apps, KI-Agenten und APIs tauschen über geschwungene Pfeile JSON-Objekte und Arrays aus.](assets/site/applications-objects.svg)

## Objekte im Mittelpunkt. :id=abstract-objects

![Die Leseansicht eines Geräts enthält die referenzierte Person unter operator.object. Das Quellobjekt ist grau dargestellt: eine Live-Referenz statt einer gespeicherten Kopie. Pfeile verbinden die umliegenden Funktionen mit dem übergeordneten Objekt.](assets/site/abstract-objects.svg?v=5)

### Mehr als JSON. :id=object-model

Flexible Eigenschaften, verschachtelte Daten und Live-Referenzen, aufgelöst in `.object`.

### Vielseitige API. :id=simple-api

CRUD, Abfragen, Aggregationen, Vektorsuche.

![Erstellen und Ändern, Abfragen, Aggregationen und Vektorsuche.](assets/site/overview-api.svg)

### Benutzer & Zugriff. :id=users-and-access

Authentifizierung, Benutzer, Berechtigungen und RBAC.

![Ein Benutzer, ein Schlüssel zur Authentifizierung und ein Schutzschild für Berechtigungen.](assets/site/overview-access.svg)

### Läuft überall. :id=run-and-deploy

Browser, Server und horizontal skalierbare Cluster.

![Ein Browserfenster, ein Server und ein RAM-Modul.](assets/site/overview-runtime.svg)

## Deine Welt. Als Objekte. :id=object-capabilities

Live-Referenzen, verschachtelte Daten, Vektoren und Dateien. Unterschiedliche Strukturen. Dasselbe Objektmodell.

### Gerät :id=example-device

> app / devices / drone-01

```json
{
  "_id": "drone-01",
  "name": "Survey drone",
  "online": true,
  "telemetry": {"altitude": 120, "battery": 87},
  "capabilities": ["mapping", "thermal"],
  "operator": {
    "type": "reference",
    "collection": "people",
    "value": "person-42"
  }
}
```

### KI-Gedächtnis :id=example-memory

> app / memories / memory-01 · Vektor beim Einfügen

```json
{
  "_id": "memory-01",
  "title": "Roof inspection",
  "text": "Solar panels need cleaning.",
  "tags": ["inspection", "solar"],
  "_vec": [0.12, -0.43, 0.87],
  "source": {
    "type": "reference",
    "collection": "files",
    "value": "scan-01"
  }
}
```

### Datei :id=example-file

> app / files / scan-01 · nach dem Upload

```json
{
  "_id": "scan-01",
  "name": "roof-scan.jpg",
  "tags": ["aerial", "inspection"],
  "resolution": {"width": 4096, "height": 2160},
  "_file": {
    "storage": "s3",
    "key": "spread-db/files/db/app/collection/files/object/scan-01/blob/f7x2",
    "mimeType": "image/jpeg"
  }
}
```

### Abfrage :id=example-query

> app / devices · aktive Kartierungsdrohnen, höchster Akkustand zuerst

```js
const devices = client.database('app').collection('devices');

await devices.find(
  {
    online: true,
    'telemetry.battery': { $gte: 50 },
    capabilities: { $contains: 'mapping' }
  },
  { sortBy: 'telemetry.battery', sort: 'desc', limit: 10 }
);
```

### Aggregation :id=example-aggregation

> app / devices · Flottenstatistik nach Online-Status

```js
const devices = client.database('app').collection('devices');

await devices.search({
  $aggregate: {
    groupBy: 'online',
    fields: {
      devices: { $count: true },
      avgBattery: { $avg: 'telemetry.battery' },
      maxAltitude: { $max: 'telemetry.altitude' }
    }
  }
});
```

## Außen JSON, innen effiziente Speicherung :id=storage-internals

Arbeite mit vollständigen Objekten. Intern teilt OBJY sie für schnellen Zugriff und effiziente Speicherung in Blöcke auf.

- **Heiße Felder:** Häufig genutzte Daten bleiben unkomprimiert im Arbeitsspeicher.
- **Kompakte Spalten:** Ausgewählte Werte liegen zusammen – für effiziente Scans und Aggregation.
- **Komprimierte Felder:** Halte mehr Daten im Arbeitsspeicher und entpacke sie beim Lesen.

> **Schnell im RAM. Optional dauerhaft in S3.**
>
> Aktiviere S3-Journale und Snapshots, um deine Objekte für die Wiederherstellung zu sichern.

![Ein vollständiges JSON-Objekt liegt vor drei Speicherebenen im RAM. Pfeile zum Sichern und Wiederherstellen verbinden sie mit einer optionalen S3-Sicherung aus Journalen und Snapshots.](assets/site/storage-internals.svg?v=2)

## Starte mit einem Knoten. :id=start-building

Starte OBJY, erstelle dein erstes Objekt und baue darauf auf.

- [Zum Schnellstart →](/content/server.md?id=quick-start)
- [Cluster einrichten](/content/server.md?id=run-a-cluster)

---

[OBJY · Baue mit Objekten.](/?id=top) · [Auf GitHub ansehen ↗](https://github.com/objy-org/objy.db)
