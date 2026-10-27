<!-- Texte und Bilder in Markdown bearbeiten. Alle :id=... unverändert lassen. -->

# In-Memory Objektdatenbank :id=top

> Baue Anwendungsfälle rund um schnelle Objekte.

Flexibles JSON. Live-Verweise. Effiziente Speicherung.\
Baue deine Anwendung auf OBJY – mit integrierter API, Authentifizierung, Benutzerverwaltung und Berechtigungen.

- [Jetzt loslegen](/get-started.md)
- [Ein Objekt in Aktion](/?id=object-capabilities)

![Apps, KI-Agenten und APIs tauschen über geschwungene Pfeile JSON-Objekte und Arrays aus.](assets/site/applications-objects.svg)

## Eine API. Alle Operationen. :id=simple-api

Erstellen, lesen, ändern und löschen. Abfragen, aggregieren und per Vektorsuche finden – über eine API.

![Abfragen, Vektoren, CRUD und Aggregation teilen sich eine API-Verbindung.](assets/site/simple-api.svg)

## JSON. Mit Verbindungen. :id=abstract-objects

Gib jedem Objekt seine eigene Form und Identität. Verbinde es über Live-Verweise mit anderen Objekten.

![Ein JSON-Objekt mit ID, Farbe, Verfügbarkeit und einem Verweis auf eine Person in der Collection people.](assets/site/abstract-objects.svg)

## Läuft überall. Wächst mit. :id=run-and-deploy

Im Browser, auf Servern oder im Cluster. Füge weitere Knoten hinzu, wenn deine Anwendung wächst.

![Ein Browserfenster, ein einzelner Server und drei verbundene Server zeigen den Betrieb vom Browser bis zum Cluster.](assets/site/run-and-deploy.svg)

## Ein Objekt. Eine echte Anwendung. :id=object-capabilities

Ein Fahrrad, sein Besitzer und wer es ändern darf. Starte mit den Daten, die deine Anwendung bereits versteht.

> app / bikes / bike-001

```json
{
  "_id": "bike-001",
  "name": "City bike",
  "available": true,
  "owner": {
    "type": "reference",
    "collection": "people",
    "value": "person-001"
  }
}
```

### Objekt :id=example-object

**Deine Daten. Deine Struktur.**

Ergänze die Felder, die deine Anwendung braucht. Der Verweis verbindet das Fahrrad mit einer Person, ohne ihr Profil in jeden Datensatz zu kopieren.

[Dem Besitzer-Verweis folgen →](/?id=example-owner)

#### Verbunden, ohne Kopien. :id=example-owner

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

**Finde, was deine Anwendung braucht.**

Finde verfügbare Fahrräder über den JavaScript-Client. Nutze dieselbe Collection für Lesezugriffe, Änderungen und Aggregation.

```js
const bikes = client.database('app')
  .collection('bikes');

await bikes.find({ available: true });
```

### Zugriff :id=example-access

**Zugriff gehört zur Plattform.**

Authentifiziere Benutzer und steuere Lese- und Schreibzugriffe über Collection-Berechtigungen. Objekte, Benutzer und Zugriffsregeln auf einer Plattform.

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
