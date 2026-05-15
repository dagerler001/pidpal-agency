# PIDPAL AGENCY — landing 🔥

Креативний one-page лендінг для української SMM-агенції [@pidpal_agency](https://instagram.com/pidpal_agency).

**Live:** https://dagerler001.github.io/pidpal-agency/

## Концепція

Слово «підпал» українською = підпалювання, а слоган агенції — *«запалюємо бренди разом»*. Лендінг побудований навколо метафори вогню:

- Курсор замінений на сірник з палаючою голівкою; іскри сипляться при русі та кліку
- Картки послуг **згорають при кліку** і відкривають детальний опис
- Hero з палаючим логотипом, заголовок «Запалюємо бренди»
- Фінальний CTA — сірникова коробка, що відкривається при кліку

## Стек

Звичайний статичний сайт — без білдів, без залежностей у `node_modules`:

- HTML + CSS + vanilla JS
- GSAP + ScrollTrigger (CDN)
- SVG `<feTurbulence>` + `<feDisplacementMap>` для ефекту згорання
- Canvas 2D для частинок іскор
- Google Fonts: Unbounded (display), Manrope (body), Caveat Brush (script)

## Файли

```
index.html      — структура сторінки
styles.css      — стилі + анімації
script.js       — курсор, burn-on-click, форма, GSAP-reveals
assets/         — логотип і фото з Instagram агенції
```

## Локальний запуск

```powershell
# просто відкрити в браузері
start index.html

# або через простий сервер
python -m http.server 8080
```
