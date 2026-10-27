<!-- Texte und Bilder in Markdown bearbeiten. Alle :id=... unverändert lassen. -->

# Schnelle, hochskalierbare<br> In-Memory-Objektdatenbank. :id=top

> Baue Anwendungsfälle rund um schnelle Objekte.

Flexibles JSON. Live-Referenzen. Effiziente Speicherung.\
Baue deine Anwendung auf OBJY – mit integrierter API, Authentifizierung, Benutzerverwaltung und Berechtigungen.

- [Jetzt loslegen](/get-started.md)
- [Objektbeispiele ansehen](/?id=object-capabilities)

![Apps, KI-Agenten und APIs tauschen über geschwungene Pfeile JSON-Objekte und Arrays aus.](assets/site/applications-objects.svg)

## Mehr als JSON. :id=abstract-objects

Dynamische Eigenschaften, verschachtelte Daten, eindeutige IDs und Live-Referenzen. Modelliere Objekte passend zu deiner Anwendung und entwickle sie mit ihr weiter.

![Ein JSON-Objekt mit ID, Farbe, Verfügbarkeit und einer Referenz auf eine Person in der Collection people.](assets/site/abstract-objects.svg)

## CRUD, Aggregationen, Vektorsuche. Eine API. :id=simple-api

Erstellen, lesen, ändern und löschen. Abfragen, aggregieren und per Vektorsuche finden – über eine API.

![Abfragen, Vektoren, CRUD und Aggregation teilen sich eine API-Verbindung.](assets/site/simple-api.svg)

## Läuft überall. Wächst mit. :id=run-and-deploy

Starte im Browser oder auf einem Server. Verteile Objekte auf einen Cluster, wenn Datenmenge und Auslastung wachsen.

![Ein Browserfenster, ein einzelner Server und drei verbundene Server zeigen den Betrieb vom Browser bis zum Cluster.](assets/site/run-and-deploy.svg)

## Benutzer & Zugriff. Inklusive. :id=users-and-access

Benutzer, Authentifizierung, Berechtigungen und rollenbasierter Zugriff. Lege fest, wer lesen, schreiben und administrieren darf.

![Benutzeridentitäten sind mit einem Anmeldeschloss und einem Schutzschild für Zugriffsrechte verbunden.](assets/site/users-access.svg)

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
