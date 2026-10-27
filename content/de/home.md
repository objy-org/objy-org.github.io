<!-- Texte und Bilder in Markdown bearbeiten. Alle :id=... unverändert lassen. -->

# Schnelle, hochskalierbare<br> In-Memory-Objektdatenbank. :id=top

> Baue Anwendungsfälle rund um schnelle Objekte.

Flexibles JSON. Live-Verweise. Effiziente Speicherung.\
Baue deine Anwendung auf OBJY – mit integrierter API, Authentifizierung, Benutzerverwaltung und Berechtigungen.

- [Jetzt loslegen](/get-started.md)
- [Anwendungsbeispiel ansehen](/?id=object-capabilities)

![Apps, KI-Agenten und APIs tauschen über geschwungene Pfeile JSON-Objekte und Arrays aus.](assets/site/applications-objects.svg)

## Mehr als JSON. :id=abstract-objects

Dynamische Eigenschaften, verschachtelte Daten, eindeutige IDs und Live-Verweise. Modelliere Objekte passend zu deiner Anwendung und entwickle sie mit ihr weiter.

![Ein JSON-Objekt mit ID, Farbe, Verfügbarkeit und einem Verweis auf eine Person in der Collection people.](assets/site/abstract-objects.svg)

## Eine API. Alle Operationen. :id=simple-api

Erstellen, lesen, ändern und löschen. Abfragen, aggregieren und per Vektorsuche finden – über eine API.

![Abfragen, Vektoren, CRUD und Aggregation teilen sich eine API-Verbindung.](assets/site/simple-api.svg)

## Läuft überall. Wächst mit. :id=run-and-deploy

Starte im Browser oder auf einem Server. Verteile Objekte auf einen Cluster, wenn Datenmenge und Auslastung wachsen.

![Ein Browserfenster, ein einzelner Server und drei verbundene Server zeigen den Betrieb vom Browser bis zum Cluster.](assets/site/run-and-deploy.svg)

## Benutzer & Zugriff. Inklusive. :id=users-and-access

Benutzer, Authentifizierung, Berechtigungen und rollenbasierter Zugriff. Lege fest, wer lesen, schreiben und administrieren darf.

![Benutzeridentitäten sind mit einem Anmeldeschloss und einem Schutzschild für Zugriffsrechte verbunden.](assets/site/users-access.svg)

## Baue eine Fahrradverleih-App. :id=object-capabilities

Fahrräder sind Objekte. Besitzer sind Objekte. Verbinde sie und finde heraus, was verfügbar ist.

#### Fahrrad :id=example-bike

> app / bikes / bike-001

```json
{
  "_id": "bike-001",
  "name": "City bike",
  "available": true,
  "price": 199,
  "description": "Everyday city rides.",
  "owner": {
    "type": "reference",
    "collection": "people",
    "value": "person-001"
  }
}
```

### Objekt :id=example-object

**Deine Daten. Deine Struktur.**

Speichere ein Fahrrad mit eigenen Eigenschaften. Verweise auf seinen Besitzer, ohne dessen Profil zu kopieren.

[Dem Besitzer-Verweis folgen →](/?id=example-owner)

#### Person :id=example-owner

**Verbunden, ohne Kopien.**

Das ist die Person, auf die das Fahrrad verweist. Lies ihr aktuelles Profil über den Verweis.

> app / people / person-001

```json
{
  "_id": "person-001",
  "name": "Alex",
  "email": "alex@example.com"
}
```

[← Zurück zum Fahrrad](/?id=example-object)

### Abfrage :id=example-query

**Finde, was verfügbar ist.**

Finde verfügbare Fahrräder, sortiert nach Preis.

```js
await bikes.find(
  { available: true },
  { sortBy: 'price', sort: 'asc', limit: 10 }
);
```

### Meta :id=example-meta

**Eine Collection. Intelligent gespeichert.**

Lege für die gesamte Collection fest, welche Felder indiziert, in Spalten gespeichert oder komprimiert werden.

> app / bikes / meta

```json
{
  "indexes": ["available", "price"],
  "columns": ["price"],
  "tiering": {
    "mode": "compressedMemory",
    "offload": ["description"],
    "minBytes": 4096
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
