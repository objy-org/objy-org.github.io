<!-- Texte und Bilder in Markdown bearbeiten. Alle :id=... unverändert lassen. -->

# In-Memory Objektdatenbank :id=top

> Baue Anwendungsfälle rund um schnelle Objekte.

Flexibles JSON. Live-Verweise. Effiziente Speicherung.\
Baue deine Anwendung auf OBJY – mit integrierter API, Authentifizierung, Benutzerverwaltung und Berechtigungen.

- [Jetzt loslegen](/get-started.md)
- [Ein Objekt in Aktion](/?id=object-capabilities)

![Apps, KI-Agenten und APIs tauschen über geschwungene Pfeile JSON-Objekte und Arrays aus.](assets/site/applications-objects.svg)

## Mehr als JSON. :id=abstract-objects

Dynamische Eigenschaften, verschachtelte Daten, eindeutige IDs und Live-Verweise. Modelliere Objekte passend zu deiner Anwendung und entwickle sie mit ihr weiter.

![Ein JSON-Objekt mit ID, Farbe, Verfügbarkeit und einem Verweis auf eine Person in der Collection people.](assets/site/abstract-objects.svg)

## Eine API. Alle Operationen. :id=simple-api

Erstellen, lesen, ändern und löschen. Abfragen, aggregieren und per Vektorsuche finden – über eine API.

![Abfragen, Vektoren, CRUD und Aggregation teilen sich eine API-Verbindung.](assets/site/simple-api.svg)

## Läuft überall. Wächst mit. :id=run-and-deploy

Im Browser, auf Servern oder im Cluster. Füge weitere Knoten hinzu, wenn deine Anwendung wächst.

![Ein Browserfenster, ein einzelner Server und drei verbundene Server zeigen den Betrieb vom Browser bis zum Cluster.](assets/site/run-and-deploy.svg)

## Benutzer & Zugriff. Inklusive. :id=users-and-access

Benutzer, Authentifizierung, Berechtigungen und rollenbasierter Zugriff (RBAC). Lege fest, wer lesen, schreiben und administrieren darf.

![Benutzeridentitäten sind mit einem Anmeldeschloss und einem Schutzschild für Zugriffsrechte verbunden.](assets/site/users-access.svg)

## Ein Objekt. Eine echte Anwendung. :id=object-capabilities

Ein Fahrrad, sein Besitzer und die Speicherung dahinter. Starte mit den Daten, die deine Anwendung bereits versteht.

#### Fahrrad :id=example-bike

> app / bikes / bike-001

```json
{
  "_id": "bike-001",
  "name": "City bike",
  "available": true,
  "price": 199,
  "description": "A lightweight bike for everyday city rides.",
  "owner": {
    "type": "reference",
    "collection": "people",
    "value": "person-001"
  }
}
```

### Objekt :id=example-object

**Deine Daten. Deine Struktur.**

Jedes Objekt hat seine eigene ID und flexible Felder. Speichere einen Preis, ergänze eine Beschreibung und folge dem Besitzer-Verweis zur verknüpften Person, ohne ihr Profil in jedes Fahrrad zu kopieren.

[Dem Besitzer-Verweis folgen →](/?id=example-owner)

#### Person :id=example-owner

**Verbunden, ohne Kopien.**

Der Verweis identifiziert die Person in der Collection people. Löse ihn beim Lesen auf, um die aktuellen Werte des verknüpften Objekts zu verwenden.

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

**Finde die passenden Fahrräder.**

Filtere verfügbare Fahrräder, sortiere nach Preis und erhalte bis zu zehn Treffer. Frage über den JavaScript-Client dieselben Felder ab, die du im Objekt siehst.

```js
const bikes = client.database('app')
  .collection('bikes');

await bikes.find(
  { available: true },
  { sortBy: 'price', sort: 'asc', limit: 10 }
);
```

### Meta :id=example-meta

**Gleiche Objekte. Intelligent gespeichert.**

Collection-Metadaten steuern, wie diese Objekte abgefragt und gespeichert werden.

- **Indizes:** `available` und `price` beschleunigen Filter und Sortierung.
- **Spalten:** `price` liegt für effiziente Aggregation in einer kompakten Spalte.
- **Kompression:** Große `description`-Daten bleiben im Arbeitsspeicher komprimiert. `minBytes` legt die Mindestgröße fest; Lesezugriffe liefern vollständige Objekte.

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

![Ein vollständiges JSON-Objekt liegt vor drei internen Speicherebenen: heißen Feldern, kompakten Spalten und komprimierten Feldern.](assets/site/storage-internals.svg)

## Starte mit einem Knoten. :id=start-building

Starte OBJY, erstelle dein erstes Objekt und baue darauf auf.

- [Zum Schnellstart →](/content/server.md?id=quick-start)
- [Cluster einrichten](/content/server.md?id=run-a-cluster)

---

[OBJY · Baue mit Objekten.](/?id=top) · [Auf GitHub ansehen ↗](https://github.com/objy-org/objy.db)
