# Weather Forecast App

Jednoduchá single-page aplikace pro zobrazení předpovědi počasí pomocí OpenWeatherMap API.

Popis aplikace  
Aplikace umožňuje uživateli vyhledat město pomocí našeptávače a zobrazit 5denní předpověď počasí v transponované tabulce (řádky pro kategorie jako den, počasí, min/max teploty; sloupce pro dny). Při kliknutí na ikonu počasí se otevře graf teplot pro daný den. Aplikace automaticky detekuje polohu uživatele a načte předpověď pro nejbližší město.

Spuštění  
Naklonujte repozitář: git clone <repo-url>
Otevřete index.html v moderním prohlížeči (podporuje poslední verze Chrome, Firefox nebo Edge).
Pro lokální server: Spusťte python3 -m http.server 8000 a otevřete http://localhost:8000.

Podporované prohlížeče  
Google Chrome (poslední verze)  
Mozilla Firefox (poslední verze)  
Microsoft Edge (poslední verze)  

Vnitřní struktura  
index.html: Hlavní HTML stránka s layoutem (input, tabulka, modal).  
app.js: JavaScript logika – načítání dat z API, našeptávač, renderování tabulky, geolokace, grafy (pomocí Chart.js).  
styles.css: CSS styly pro responsive design, animace a UI.  
cities.json: Lokální seznam měst (nepoužitý; našeptávač používá API).  
images: Statické obrázky a ikony.  
weatherCodes.json: Mapování kódů počasí (nepoužitý).  