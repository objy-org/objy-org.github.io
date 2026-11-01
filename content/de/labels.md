# Beschriftungen der Website

Nur die rechte Spalte bearbeiten. Abschnittsüberschriften und die linke Spalte unverändert lassen.

## Site

| Location | Text |
| --- | --- |
| Page title | objy.db — Baue Anwendungsfälle rund um schnelle Objekte. |
| Page description | objy.db ist eine In-Memory-Objektdatenbank mit einfacher API, Authentifizierung und Benutzerverwaltung. Lokal starten, überall betreiben. |

## Navigation

| Location | Text |
| --- | --- |
| Home label | OBJY Startseite |
| Main navigation label | Hauptnavigation |
| Section navigation label | Auf dieser Seite |
| Documentation navigation label | Dokumentationsnavigation |
| Mobile menu | Menü |
| Language menu | Sprache ändern |
| Skip link | Zum Inhalt springen |
| Product link | [OBJY](#/?id=top) |
| Learn link | [Lernen](#/learn) |
| Get started link | [Loslegen](#/get-started) |
| Documentation link | [Dokumentation](#/documentation) |
| Source link | [GitHub](https://github.com/objy-org) |

## Controls

| Location | Text |
| --- | --- |
| Copy button | Kopieren |
| Copy success | Kopiert! |
| Copy fallback | Auswählen |
| Copy label | Code kopieren |
| Loading label | Wird geladen… |

## Documents

| Location | Text |
| --- | --- |
| Unavailable title | Seite nicht verfügbar |
| Unavailable description | Diese Markdown-Seite konnte nicht geladen werden. Prüfe den Link oder versuche es erneut. |
| Back home | Zurück zur Startseite |

## Architecture diagram

| Location | Text |
| --- | --- |
| Crud | CRUD |
| Query | Abfragen |
| Aggregate | Aggregation |
| Vector | Vektoren |
| Device collection | devices |
| Device id | `"_id": "drone-01",` |
| Device name | `"name": "Survey drone",` |
| Device status | `"status": "ready",` |
| Device battery | `"battery": 87` |
| Person collection | people |
| Person id | `"_id": "person-42",` |
| Person name | `"name": "Alex",` |
| Person role | `"role": "pilot"` |
| Memory collection | memories |
| Memory id | `"_id": "memory-01",` |
| Memory title | `"title": "First flight",` |
| Memory vector | `"_vec": [0.2, 0.8, 0.4]` |

## Storage diagram

| Location | Text |
| --- | --- |
| Inside | In objy.db |
| Memory | IM RAM |
| Hot | Heiße Felder |
| Columns | Kompakte Spalten |
| Compressed | Komprimiert |
| Hot detail | Häufig genutzte Felder. |
| Hot benefit | Direkt lesen, unkomprimiert. |
| Columns detail | Werte liegen zusammen. |
| Columns benefit | Für Scans & Aggregation. |
| Compressed detail | Mehr Daten im RAM. |
| Compressed benefit | Erst beim Lesen entpacken. |

## Application diagram

| Location | Text |
| --- | --- |
| Apps | Apps |
| Agents | KI-Agenten |
| Apis | APIs |
| Json identity | `"_id": "item-01",` |
| Json name | `"name": "Orbit",` |
| Json tags | `"tags": ["neu", "blau"],` |
| Json vector | `"_vec": [0.2, 0.8, 0.4]` |

## Learn diagrams

| Location | Text |
| --- | --- |
| Read | Lesen → |
| Collection | Collection |
| Hot | Heiße Felder |
| Columns | Spalten |
| Compressed | Komprimiert |
| Bike collection | `bikes` |
| Bike label | `bikes / bike-01` |
| Person label | `people / person-42` |
| Bike name | `Bike` |
| Person name | `Alex` |
| Bike summary | `{ Bike }` |
| Bike identity | `"_id": "bike-01"` |
| Reference read | `owner.object.name → "Alex"` |
| Object id | `  "_id": "bike-01",` |
| Object name | `  "name": "City bike",` |
| Object available | `  "available": true,` |
| Object price | `  "price": 15,` |
| Object tags | `  "tags": ["city", "electric"]` |
| Application | Anwendung |
| Server | Server |
| Api auth | API + Auth |
| Database | Datenbank |
| Node a | Knoten A |
| Node b | Knoten B |
| Node c | Knoten C |
| Node d | Knoten D |
| Shard 1 | Shard 1 |
| Shard 2 | Shard 2 |
| Replica | Replikat |
| Vector query | Suchvektor |
| Vector matches | Ähnliche Fahrräder |
