# File upload — slajdy do prezentacji (PL)

**1920×1080 SVG** w stylu slajdów XSS (biało, pastelowe rogi, navy `#1e2a3a`, żółty pasek **Lekcja**).  
**Język polski, prosto —** materiał edukacyjny ogólny (CWE-434, OWASP, Portswigger, Intigriti), **nie musi** = kroki labu FileUpload na porcie 3005.

## `presentation-style/` — zestaw główny (kolejność 01→08)

| Plik | O czym |
|------|--------|
| `01-co-to-jest.svg` | Definicja + 4 możliwe skutki |
| `02-trzy-kroki-ataku.svg` | Wrzuć → zapis → otwórz URL |
| `03-skutki-kafelki.svg` | RCE · XSS · DoS · phishing |
| `04-bledy-aplikacji.svg` | Typowe pomyłki devów |
| `05-popularne-obejscia.svg` | Rozszerzenia, MIME, ścieżka, polyglot |
| `06-obrona-warstwami.svg` | 3 warstwy obrony (jak slajd verification/sanitize) |
| `07-php-vs-static.svg` | Różnica stacku — kiedy jest RCE |
| `08-checklista.svg` | 6 pytań na koniec |

Spis: `presentation-style/00-spis-slajdow.txt`

## Pobieranie

- **ZIP:** [`file-upload-presentation-slides.zip`](file-upload-presentation-slides.zip) — `presentation-style/` + ten README  
- GitHub: branch `cursor/fileupload-presentation-dfcc` lub `main` po merge [PR #3](https://github.com/JosephPrzemyslaw/WebSecurity/pull/3)

Import: PowerPoint / Keynote → wstaw SVG. Eksport PNG: Inkscape, Figma, lub przeglądarka.

## Starsze diagramy (ang., pod lab)

W katalogu nadrzędnym `presentation/` (01–05, styl member shop) — opcjonalnie, można pominąć.