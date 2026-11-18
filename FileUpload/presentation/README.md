# File upload — ilustracje do prezentacji

## `presentation-style/` (zalecane)

Slajdy **1920×1080** w stylu Twojej prezentacji XSS: białe tło, pastelowe „bloby” w rogach, navy **`#1e2a3a`**, kroki **1–4** (niebieski / zielony / żółty / fiolet), różowe callouty, żółty pasek **Lesson**.

| Plik | Treść |
|------|--------|
| [01-hosted-html-four-steps.svg](presentation-style/01-hosted-html-four-steps.svg) | Ćw. 2: upload → img → GET → banner |
| [02-defense-in-practice.svg](presentation-style/02-defense-in-practice.svg) | Obrona w głąb (jak „verification / sanitize”) |
| [03-mime-spoof-four-steps.svg](presentation-style/03-mime-spoof-four-steps.svg) | Ćw. 4: fail → Burp → `.jpg` → `cat` |
| [04-img-vs-document.svg](presentation-style/04-img-vs-document.svg) | `<img>` vs dokument |
| [05-static-vs-interpreter.svg](presentation-style/05-static-vs-interpreter.svg) | Node static vs PHP (tylko slajd) |

Kopia: `/opt/cursor/artifacts/file-upload-slides-presentation-style/`

## Wcześniejsze SVG (member shop, ciemniejsza paleta)

| Plik | Kiedy na slajdzie | Zgodność z labem |
|------|-------------------|------------------|
| [01-upload-hosted-document.svg](01-upload-hosted-document.svg) | Ćw. 2: upload `evil.html`, Open file, banner na originie | Tak |
| [02-img-vs-document.svg](02-img-vs-document.svg) | Dlaczego avatar = `<img>`; iframe / nowa karta | Tak (anti-pattern) |
| [03-mime-spoof-junk-on-disk.svg](03-mime-spoof-junk-on-disk.svg) | Ćw. 4: Burp `image/jpeg`, `cat` na `.jpg` | Tak |
| [04-defense-in-depth.svg](04-defense-in-depth.svg) | Podsumowanie: CWE-434, OWASP, warstwy | Teoria |
| [05-php-rce-contrast.svg](05-php-rce-contrast.svg) | **Prezentacja:** Node static vs PHP interpreter (nie w kodzie labu) | Tylko slajd |

Kopie eksportu agenta (jeśli budujesz z VM): `/opt/cursor/artifacts/file-upload-slides/`.

## Pomysły na kolejne slajdy (nie narysowane tutaj)

Źródła: [Intigriti Hackademy](https://www.intigriti.com/researchers/hackademy/file-upload-vulnerabilities), [CWE-434](https://cwe.mitre.org/data/definitions/434.html), [ASP.NET file uploads](https://learn.microsoft.com/en-us/aspnet/core/mvc/models/file-uploads?view=aspnetcore-6.0).

1. **Path traversal w nazwie pliku** — `POST` z `../../…` → zapis poza `uploads/` (możliwe w słabym kodzie; w labie warto tylko wspomnieć).
2. **Double extension** — `report.pdf.exe` / `shell.php.jpg` — bypass listy rozszerzeń.
3. **Denylist vs allowlist** — dlaczego denylist przegrywa (Apache `.php5`, case, null byte — historycznie).
4. **SVG jako wektor** — stored XSS w przeglądarce, nie RCE (ćw. 2 variant B).
5. **Storage DoS** — brak limitu rozmiaru / liczby plików (Intigriti).
6. **Overwrite / defacement** — nadpisanie statycznego pliku gdy nazwa przewidywalna.
7. **Polyglot** — jeden plik: valid JPEG header + HTML (zaawansowany).
8. **Separate domain** — `user-cdn.example` bez cookies sesji sklepu.

## Różnice względem PortSwiggera (żeby nie wyglądało jak kopia)

- Inna paleta (ciepły sklep vs niebieski Academy).
- Osobne slajdy zamiast jednego „POST u góry, GET u dołu”.
- Akcent na **twoim** ćwiczeniu (Node, `/account/avatar`, brak PHP).
- Slajd 05 jako jawny **kontrast** — RCE omawiasz na prezentacji, nie w aplikacji.