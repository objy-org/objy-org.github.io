<!-- Texte und Bilder in Markdown bearbeiten. Alle :id=... unverändert lassen. -->

# Baue Anwendungen rund um schnelle Objekte. :id=top

> In-Memory-Objektdatenbank

OBJY ist eine In-Memory-Objektdatenbank, die schnellen Zugriff mit effizienter Speicherung verbindet – als Basis für deine gesamte Anwendung. API, Authentifizierung, Benutzerverwaltung, Berechtigungen und mehr sind schon integriert.

![Apps, KI-Agenten und APIs tauschen über geschwungene Pfeile JSON-Objekte und Arrays aus.](assets/site/applications-objects.svg)

## Einfache API :id=simple-api

Objekte erstellen, lesen, ändern und löschen – über eine einfache API. Abfragen, aggregieren und mit Vektorsuche ähnliche Objekte finden.

![Vier große API-Funktionen – Abfragen, Vektoren, CRUD und Aggregation – sind mit einer gemeinsamen API verbunden.](assets/site/simple-api.svg)

## Schnelles JSON. Mit Extras. :id=abstract-objects

Modelliere alles mit flexiblen JSON-Objekten, eindeutigen IDs und Live-Verweisen.

![Ein JSON-Objekt mit ID, Farbe, Verfügbarkeit und einem Verweis auf eine Person in der Collection people.](assets/site/abstract-objects.svg)

## Läuft überall. Wächst mit. :id=run-and-deploy

Im Browser, auf Servern oder im Cluster. Füge weitere Knoten hinzu und skaliere horizontal mit deiner Anwendung.

![Ein Browserfenster, ein einzelner Server und drei verbundene Server zeigen den Betrieb vom Browser bis zum Cluster.](assets/site/run-and-deploy.svg)

## So speichert OBJY. :id=storage-internals

Jedes Objekt wird intern in intelligente Blöcke aufgeteilt – für schnellen Zugriff und effiziente Speicherung.

- **Heiße Felder:** Häufig genutzte Felder bleiben unkomprimiert im Arbeitsspeicher und sind schnell zugänglich.
- **Kompakte Spalten:** Ausgewählte Werte liegen zusammen, damit Scans und Analysen effizient bleiben.
- **Komprimierte Felder:** Weitere Daten bleiben komprimiert im Arbeitsspeicher und werden erst beim Lesen entpackt. Das spart Speicherplatz.

![Ein vollständiges JSON-Objekt liegt vor drei internen Speicherebenen: heißen Feldern, kompakten Spalten und komprimierten Feldern – alles im Arbeitsspeicher.](assets/site/storage-internals.svg)

## Objekte, die mehr können. :id=object-capabilities

Gib jedem Objekt seine eigene Form, Verbindungen und Regeln.

- **Dynamische Eigenschaften:** Ergänze oder ändere Felder nach Bedarf. Kombiniere Werte, Arrays und verschachtelte Objekte ohne festes Schema.
- **Echtzeit-Verweise:** Verbinde Objekte über Collections hinweg und löse ihre aktuellen Werte beim Lesen auf.
- **Benutzer und Berechtigungen:** Auch Benutzer sind Objekte. Integrierte Authentifizierung und Collection-Berechtigungen steuern, wer lesen oder Änderungen vornehmen darf.

![Ein JSON-Objekt erhält ein neues Feld, verweist auf ein Benutzerobjekt und ist mit Lese- und Schreibrechten verbunden.](assets/site/object-capabilities.svg)

## Deine Anwendung. Dein Betrieb. :id=deployment

Starte lokal, nutze deine eigene Cloud oder betreibe die Datenbank direkt im Browser.

### Schnellstart :id=deploy-quick-start

Starte lokal mit Node.js oder Docker. Skaliere danach zum Cluster auf VMs, in Containern oder über mehrere Prozesse.

- [GitHub](https://github.com/objy-org)
- [Lokal starten](DATABASE.md?id=run-a-node)
- [Cluster einrichten](DATABASE.md?id=deploy-a-cluster)

### Deine eigene Cloud :id=bring-your-own-cloud

Wähle deinen Anbieter und behalte die Kontrolle über deine Infrastruktur – mit eigenem Netzwerk und S3-kompatiblem Speicher.

- [Hetzner](https://www.hetzner.com/cloud/)
- [IONOS](https://cloud.ionos.com/)
- [Google Cloud](https://cloud.google.com/)
- [AWS](https://aws.amazon.com/)
- [Azure](https://azure.microsoft.com/)

### Browser :id=deploy-browser

Betreibe objy.db direkt im Browser. Halte Objekte im Arbeitsspeicher für schnelle Lese- und Schreibzugriffe – genau dort, wo deine Anwendung läuft.
