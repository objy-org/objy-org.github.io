<!-- Texte und Bilder in Markdown bearbeiten. Alle :id=... unverändert lassen. -->

# Schnelle, hochskalierbare<br> In-Memory-Objektdatenbank. :id=top

> Baue Anwendungsfälle rund um schnelle Objekte.

- ![](assets/site/icons/features/flexible-objects.svg) Flexibles JSON
- ![](assets/site/icons/features/query-aggregate.svg) OLAP + OLTP
- ![](assets/site/icons/features/cross-runtime.svg) Läuft überall
- ![](assets/site/icons/features/authentication.svg) API & Auth inklusive

![Eine geschichtete OBJY-Datenbank mit einem JSON-Objekt im Zentrum, verbunden mit Apps, KI-Agenten, APIs und kleineren Objektknoten.](assets/site/applications-objects.svg)

## Was wirst du bauen? :id=object-capabilities

### ![](assets/site/icons/use-cases/agents.svg) KI-Agenten & Gedächtnis :id=use-case-agents

Speichere Erinnerungen und Embeddings gemeinsam. Finde den passenden Kontext per Vektorsuche.

### ![](assets/site/icons/use-cases/analytics.svg) Analytics :id=use-case-analytics

Analysiere deine Daten mit schnellen Filtern und Aggregationen. Berechne Kennzahlen direkt aus deinen Objekten.

### ![](assets/site/icons/use-cases/apps.svg) Anwendungs-Backends :id=use-case-apps

Baue Tools und SaaS-Anwendungen mit integrierten APIs, Authentifizierung, Benutzern und Berechtigungen.

### ![](assets/site/icons/use-cases/anything.svg) Oder etwas ganz anderes... :id=use-case-anything

Deine Objekte. Deine Ideen. Baue, was dir vorschwebt.

## Flexibles JSON. Vielseitige APIs. :id=feature-highlights

Schnelle, flexible Daten sind erst der Anfang. Entdecke, was OBJY deiner Anwendung bietet — von der In-Memory-Engine bis zum verteilten Backend.

![CRUD, Abfragen, Aggregation und Vektorsuche über drei überlappenden JSON-Beispielen: eine Person, eine KI-Erinnerung und ein vernetztes Gerät.](assets/site/architecture.svg)

### Außen JSON, innen effiziente Speicherung :id=storage-internals

Arbeite mit vollständigen Objekten. Intern teilt OBJY sie für schnellen Zugriff und effiziente Speicherung in Blöcke auf.

- **Heiße Felder:** Häufig genutzte Daten bleiben unkomprimiert im Arbeitsspeicher.
- **Kompakte Spalten:** Ausgewählte Werte liegen zusammen – für effiziente Scans und Aggregation.
- **Komprimierte Felder:** Halte mehr Daten im Arbeitsspeicher und entpacke sie beim Lesen.

> **Schnell im RAM. Optional dauerhaft in S3.**
>
> Aktiviere S3-Journale und Snapshots, um deine Objekte für die Wiederherstellung zu sichern.

![Ein vollständiges JSON-Objekt liegt vor drei Speicherebenen im RAM. Pfeile zum Sichern und Wiederherstellen verbinden sie mit einer optionalen S3-Sicherung aus Journalen und Snapshots.](assets/site/storage-internals.svg)


### Datenbankkern :id=database-core

Dieselbe Engine, eingebettet in Browser und Node.js. [Zur Core-Dokumentation](/content/database.md).

#### ![](assets/site/icons/features/flexible-objects.svg) Objekte ohne starre Schemas :id=flexible-objects

Kombiniere verschachtelte Eigenschaften, Arrays und unterschiedliche Datentypen. Deine Objekte wachsen mit deiner Anwendung.

#### ![](assets/site/icons/features/live-references.svg) Live-Referenzen statt Kopien :id=live-references

Verbinde Objekte und löse ihre Referenzen beim Lesen auf. Gespeichert wird die Beziehung, ohne das referenzierte Objekt zu duplizieren.

#### ![](assets/site/icons/features/in-memory.svg) Objekte mit In-Memory-Geschwindigkeit :id=in-memory

Arbeite direkt mit Objekten im Arbeitsspeicher. Im zentralen Datenpfad sind keine Lesezugriffe auf die Festplatte nötig.

#### ![](assets/site/icons/features/hot-compressed.svg) Häufige Felder direkt. Den Rest komprimiert. :id=hot-compressed

Halte häufig genutzte Felder im Speicher direkt zugänglich und komprimiere den Rest jedes Objekts.

#### ![](assets/site/icons/features/columns.svg) Innen Spalten. Außen Objekte. :id=compact-columns

Kompakte Spalten beschleunigen numerische Aggregationen. Beim Lesen erhältst du dieselben Daten als vollständige Objekte zurück.

#### ![](assets/site/icons/features/shared-values.svg) Gleiche Werte, smarter gespeichert :id=shared-values

Gemeinsame Wörterbücher reduzieren den Speicherbedarf von Werten, die immer wieder vorkommen.

#### ![](assets/site/icons/features/metadata.svg) Speicher über Metadaten steuern :id=collection-metadata

Konfiguriere Indizes, Spalten und Komprimierung pro Collection. Deine Objekte bleiben dabei einfach zu verwenden.

#### ![](assets/site/icons/features/vector-search.svg) Bedeutung finden mit Vektorsuche :id=vector-search

Durchsuche die von deiner Anwendung bereitgestellten Embeddings mit einem integrierten HNSW-Index, direkt neben deinen Objektdaten.

#### ![](assets/site/icons/features/query-aggregate.svg) Abfragen. Gruppieren. Zusammenrechnen. :id=query-aggregation

Filtere und sortiere Objekte, gruppiere deine Daten und berechne Anzahl, Summe oder Durchschnitt mit derselben Engine.

#### ![](assets/site/icons/features/bulk-operations.svg) Für ein Objekt. Oder viele. :id=bulk-operations

Einzelne und gebündelte Schreibvorgänge nutzen denselben Ausführungspfad. Batches gehören so ganz natürlich zur Arbeit mit Objekten.

#### ![](assets/site/icons/features/cross-runtime.svg) Eine Engine für beide Welten :id=cross-runtime

Nutze dieselbe Datenbank-API im Browser und in Node.js. Die Engine läuft dort, wo deine Anwendung läuft.

### DB Server :id=db-server

Ergänze den Kern um Anwendungsdienste, verteilten Betrieb und optionale Persistenz. [Zur Server-Dokumentation](/content/server.md).

#### ![](assets/site/icons/features/rest-client.svg) Verbinden über REST oder JavaScript :id=rest-client

Greife aus Apps und Diensten über die REST API oder den JavaScript-Client auf die Datenbank zu.

#### ![](assets/site/icons/features/authentication.svg) Benutzer und Authentifizierung inklusive :id=authentication

Verwalte Benutzeridentitäten und authentifizierte Sitzungen direkt in deinem Datenbank-Backend.

#### ![](assets/site/icons/features/permissions.svg) Zugriff bis zum einzelnen Objekt :id=object-permissions

Kombiniere Collection-Berechtigungen, Rollen und Regeln pro Objekt, um den Zugriff auf deine Daten zu steuern.

#### ![](assets/site/icons/features/files.svg) Auch Dateien sind Objekte :id=file-objects

Speichere Dateimetadaten als Objekte und die Dateiinhalte in S3, geschützt durch dieselben Objektberechtigungen.

#### ![](assets/site/icons/features/hooks.svg) Deine Logik bei jeder Operation :id=operation-hooks

Ergänze mit Server-Hooks eigenes Verhalten beim Erstellen, Lesen, Ändern und Löschen von Objekten.

#### ![](assets/site/icons/features/sharding.svg) Objekte über Maschinen verteilen :id=object-sharding

Verteile Objekte per Sharding auf mehrere Knoten. So kann deine Datenbank über mehrere Maschinen laufen.

#### ![](assets/site/icons/features/replication.svg) Replikate, die wieder aufholen :id=replication-recovery

Asynchrone Replikation hält Kopien auf anderen Knoten vor. Nach Unterbrechungen können Replikate wieder aufholen.

#### ![](assets/site/icons/features/s3-durability.svg) Optionale S3-Persistenz :id=s3-durability

Aktiviere ein lokales Write-Ahead-Log, S3-Journale und Snapshots, um Daten dauerhaft zu speichern und nach einem Neustart wiederherzustellen.

#### ![](assets/site/icons/features/streaming-import.svg) Daten rein. Batch für Batch. :id=streaming-import

Importiere NDJSON in begrenzten Batches, ohne die gesamte Quelldatei auf einmal in den Arbeitsspeicher zu laden.

#### ![](assets/site/icons/features/cluster-console.svg) Den Cluster im Blick :id=cluster-console

Prüfe Speicher, Replikation, Betriebsbereitschaft und Topologie in der Administrationskonsole.

---

[OBJY · Baue mit Objekten.](/?id=top) · [Auf GitHub ansehen ↗](https://github.com/objy-org/objy)
