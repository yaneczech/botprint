# Tutoriál - Niimbot Printer App

Tento tutoriál vás provede základními úkoly, které můžete s aplikací dělat.

## 1. První spuštění

Po instalaci a spuštění aplikace uvidíte:
- **Levý panel** - nástroje pro návrh (výběr, text, kreslení, tvary)
- **Střed** - canvas s mřížkou pro návrh štítku
- **Horní lišta** - operace se soubory a import
- **Pravý panel** - ovládání tiskárny

## 2. Jednoduchý textový štítek

### Krok za krokem:

1. **Přidejte text**
   - Klikněte na "📝 Text" v horní liště
   - Na canvasu se objeví text "Text"
   - Dvojklikem text editujte, napište např. "Ahoj světe!"

2. **Upravte vzhled**
   - Vyberte text (pokud není vybraný)
   - Klikněte na "🔤 Fonty"
   - Vyberte font, který se vám líbí
   - Zavřete správce fontů

3. **Změňte velikost**
   - Táhněte za rohy textového pole pro změnu velikosti
   - Nebo dvakrát klikněte a upravte velikost písma v editoru

4. **Uložte design**
   - Klikněte na "💾 Uložit"
   - Soubor se uloží jako `label-design.json`

## 3. Štítek s logem

### Příprava:

Mějte připravený SVG nebo PNG soubor s vaším logem.

### Krok za krokem:

1. **Importujte logo**
   - Klikněte na "🖼️ Importovat obrázek"
   - Vyberte váš soubor (SVG nebo PNG)
   - Logo se objeví na canvasu

2. **Upravte velikost loga**
   - Vyberte logo kliknutím
   - Táhněte za rohy pro změnu velikosti
   - Držte Shift pro zachování poměru stran

3. **Přidejte text pod logo**
   - Klikněte na "📝 Text"
   - Přesuňte text pod logo
   - Upravte text na název vaší firmy

4. **Přidejte rámeček**
   - Klikněte na "⬜ Obdélník"
   - Upravte velikost, aby pokryl celý štítek
   - Pošlete ho do pozadí (pravé tlačítko > Send to back)

## 4. Hromadný tisk z Excelu

### Příprava Excel souboru:

Vytvořte Excel soubor s těmito sloupci:

| Jméno | Pozice | Telefon |
|-------|--------|---------|
| Jan Novák | Developer | +420 123 456 789 |
| Eva Svobodová | Designer | +420 987 654 321 |
| Petr Dvořák | Manager | +420 555 666 777 |

### Krok za krokem:

1. **Vytvořte šablonu štítku**
   - Přidejte 3 textová pole
   - První nazvěte "Jméno"
   - Druhé nazvěte "Pozice"
   - Třetí nazvěte "Telefon"
   - Uspořádejte je na štítku

2. **Importujte Excel data**
   - Klikněte na "📊 Import z Excelu"
   - Vyberte váš .xlsx soubor
   - Zkontrolujte náhled dat
   - Klikněte "Importovat a mapovat data"

3. **Tisk**
   - První řádek aktualizuje současný design
   - Pro tisk všech řádků použijte počet kopií
   - Nebo opakujte import pro každý řádek

## 5. Vlastní fonty

### Kde vzít fonty:

- Google Fonts (https://fonts.google.com) - zdarma
- DaFont (https://www.dafont.com) - různé licence
- Font Squirrel (https://www.fontsquirrel.com) - komerčně použitelné

### Krok za krokem:

1. **Stáhněte font**
   - Vyberte font z některé z výše uvedených stránek
   - Stáhněte ve formátu TTF nebo OTF

2. **Nahrajte do aplikace**
   - Klikněte na "🔤 Fonty"
   - Klikněte na "Choose file" u "Nahrát vlastní fonty"
   - Vyberte stažený .ttf nebo .otf soubor
   - Font se načte a zobrazí v seznamu

3. **Použijte font**
   - Vyberte textový objekt na canvasu
   - V okně správy fontů klikněte na načtený font
   - Text se okamžitě změní

## 6. Tisk na Niimbot tiskárně

### Příprava:

- Zapněte Niimbot tiskárnu
- Vložte role štítků
- Zapněte Bluetooth na počítači

### Krok za krokem:

1. **Najděte tiskárnu**
   - V pravém panelu klikněte "🔍 Najít tiskárny"
   - Počkejte na nalezení zařízení
   - Vaše tiskárna by se měla objevit v seznamu

2. **Připojte se**
   - Vyberte tiskárnu ze seznamu
   - Klikněte "🔗 Připojit"
   - Po úspěšném připojení se zobrazí informace o tiskárně

3. **Nastavte parametry**
   - **Hustota tisku** (1-5): 3 je dobrý začátek
   - Pokud je tisk příliš světlý, zvyšte na 4 nebo 5
   - Pokud je příliš tmavý, snižte na 2 nebo 1
   - **Počet kopií**: kolik stejných štítků chcete vytisknout

4. **Tisknout**
   - Klikněte "🖨️ Tisknout"
   - Počkejte na dokončení tisku
   - První tisk může trvat trochu déle

## 7. Pokročilé techniky

### Vrstvy a uspořádání

- **Pořadí prvků**: pravé tlačítko > Bring to front / Send to back
- **Skupiny**: vyberte více objektů (Ctrl/Cmd + klik) a seskupte je
- **Zarovnání**: použijte mřížku pro přesné umístění

### Kopírování a klonování

- **Duplikovat**: Ctrl/Cmd + C, Ctrl/Cmd + V
- **Klonování**: vyberte objekt, táhněte při držení Alt

### Rotace a převrácení

- **Rotace**: táhněte za rohový úchyt při vybraném objektu
- **Převrácení**: pravé tlačítko > Flip horizontal/vertical

## 8. Řešení problémů

### Tiskárna se nenajde
- Restartujte Bluetooth
- Restartujte tiskárnu
- Zkontrolujte, že tiskárna není připojená k jinému zařízení

### Tisk je příliš světlý/tmavý
- Upravte hustotu tisku v pravém panelu
- Vyzkoušejte různé hodnoty (1-5)

### Font se nenačte
- Zkontrolujte, že je to .ttf nebo .otf soubor
- Někdy je potřeba restartovat aplikaci

### Canvas je příliš malý
- To je normální - přizpůsobte design velikosti canvasu
- Canvas odpovídá reálné velikosti štítku

## 9. Tipy a triky

### Rychlé klávesy
- **Ctrl/Cmd + Z** - Zpět
- **Ctrl/Cmd + Y** - Znovu
- **Ctrl/Cmd + C** - Kopírovat
- **Ctrl/Cmd + V** - Vložit
- **Delete** - Smazat vybraný objekt

### Přesné umístění
- Použijte mřížku jako vodítko
- Držte Shift při pohybu pro rovné čáry
- Použijte zoom (Ctrl/Cmd + kolečko myši)

### Efektivní workflow
1. Nejdřív vytvořte šablonu
2. Otestujte tisk na jednom štítku
3. Pokud je OK, použijte pro hromadný tisk

### Úspora štítků
- Vždy otestujte design před hromadným tiskem
- Použijte náhled před tiskem
- Uložte osvědčené šablony pro opakované použití

## 10. Příklady použití

### Jmenovky na konferenci
1. Excel s účastníky (Jméno, Firma)
2. Šablona s logem konference
3. Hromadný tisk

### Skladové štítky
1. Excel s produkty (SKU, Název, Cena)
2. Šablona s čárovým kódem (zatím nutno přidat jako obrázek)
3. Tisk podle potřeby

### Adresní štítky
1. Excel s adresami
2. Jednoduchá textová šablona
3. Hromadný tisk

### Dárkové štítky
1. Design s SVG grafikou
2. Vlastní font pro vánoční pocit
3. Individuální tisk

---

Máte otázky? Otevřete issue na GitHubu!
