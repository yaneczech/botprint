# Niimbot Printer App

Cross-platform desktopová aplikace pro tisk štítků na Niimbot tiskárnách. Aplikace podporuje import SVG souborů, bitmapových obrázků, vlastní fonty a import dat z Excel tabulek.

## Funkce

- ✅ **Cross-platform podpora** - funguje na macOS, Windows i Linux
- ✅ **Komunikace s Niimbot tiskárnami** - přes Bluetooth/USB
- ✅ **Grafický editor štítků** - WYSIWYG editor s podporou přetahování
- ✅ **Import SVG** - vektorové soubory s plnou podporou
- ✅ **Import bitmapových obrázků** - PNG, JPG, GIF atd.
- ✅ **Vlastní fonty** - nahrání a použití TTF/OTF fontů
- ✅ **Excel import** - hromadný tisk z Excel tabulek (.xlsx)
- ✅ **Nástroje pro kreslení** - text, tvary, volné kreslení
- ✅ **Ukládání/načítání designů** - ve formátu JSON

## Podporované Niimbot tiskárny

Aplikace by měla fungovat s většinou Niimbot tiskáren, včetně:
- Niimbot B21
- Niimbot B1
- Niimbot B3S
- Niimbot D11
- A další modely s Bluetooth podporou

## Instalace

### Požadavky

- Node.js 18 nebo novější
- npm nebo yarn

### Instalace závislostí

```bash
npm install
```

## Vývoj

### Spuštění v dev režimu

```bash
npm run electron:dev
```

Tento příkaz spustí:
1. Vite dev server pro React frontend
2. Electron v development režimu s hot reload

### Build

#### Build pro macOS

```bash
npm run build:mac
```

Výstup: DMG a ZIP soubory v adresáři `dist/`

#### Build pro Windows

```bash
npm run build:win
```

Výstup: NSIS installer a portable .exe v adresáři `dist/`

#### Build pro Linux

```bash
npm run build:linux
```

Výstup: AppImage a DEB balíček v adresáři `dist/`

#### Build pro všechny platformy

```bash
npm run build
```

## Jak používat

### 1. Připojení k tiskárně

1. Zapněte Niimbot tiskárnu
2. V aplikaci klikněte na "🔍 Najít tiskárny" v pravém panelu
3. Vyberte tiskárnu ze seznamu
4. Klikněte na "🔗 Připojit"

### 2. Návrh štítku

#### Přidání textu
- Klikněte na "📝 Text" v horní liště
- Text můžete editovat dvojklikem
- Změňte font pomocí tlačítka "🔤 Fonty"

#### Přidání tvarů
- Klikněte na "⬜ Obdélník" nebo "⭕ Kruh"
- Tvary můžete měnit velikost a pohybovat s nimi

#### Import obrázků
- Klikněte na "🖼️ Importovat obrázek"
- Podporované formáty: PNG, JPG, GIF, SVG
- SVG soubory se importují jako vektorová grafika

#### Volné kreslení
- Vyberte nástroj "✏️ Kreslit" v levém panelu
- Nakreslete cokoliv přímo na plátno

### 3. Import vlastních fontů

1. Klikněte na "🔤 Fonty" v horní liště
2. Klikněte na "Vyberte Excel soubor" a vyberte .ttf nebo .otf soubor
3. Font se automaticky načte a bude dostupný v seznamu
4. Pro aplikování: vyberte textový objekt a klikněte na požadovaný font

### 4. Import dat z Excelu

1. Připravte Excel soubor s daty:
   - První řádek obsahuje názvy sloupců
   - Každý další řádek představuje jeden štítek k tisku

2. Vytvořte design štítku s textovými poli:
   - Pojmenujte textová pole podle názvů sloupců v Excelu
   - Například: text "Jméno" bude nahrazen hodnotami ze sloupce "Jméno"

3. Klikněte na "📊 Import z Excelu"
4. Vyberte váš .xlsx soubor
5. Zkontrolujte náhled dat
6. Klikněte na "Importovat a mapovat data"

### 5. Tisk

1. Ujistěte se, že jste připojeni k tiskárně
2. Nastavte hustotu tisku (1-5) - vyšší číslo = tmavší tisk
3. Nastavte počet kopií
4. Klikněte na "🖨️ Tisknout"

### 6. Ukládání a načítání designů

#### Uložení
- Klikněte na "💾 Uložit"
- Design se uloží jako JSON soubor

#### Načtení
- Klikněte na "📂 Otevřít"
- Vyberte uložený JSON soubor
- Design se načte do editoru

## Architektura projektu

```
botprint/
├── electron/              # Electron main process
│   ├── main.ts           # Hlavní Electron proces
│   ├── preload.ts        # Preload skript pro API
│   └── niimbot/          # Niimbot komunikační protokol
│       ├── printer.ts    # Hlavní třída tiskárny
│       ├── protocol.ts   # Niimbot protokol
│       └── bluetooth-adapter.ts  # Bluetooth adapter
├── src/                  # React frontend
│   ├── components/       # React komponenty
│   │   ├── App.tsx
│   │   ├── LabelDesigner.tsx    # Canvas editor
│   │   ├── Toolbar.tsx          # Horní lišta
│   │   ├── Sidebar.tsx          # Levý panel s nástroji
│   │   ├── PrinterPanel.tsx     # Pravý panel - tiskárna
│   │   ├── ExcelImporter.tsx    # Excel import
│   │   └── FontManager.tsx      # Správa fontů
│   ├── types/
│   │   └── global.d.ts   # TypeScript definice
│   ├── main.tsx          # React vstupní bod
│   └── index.css         # Globální styly
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Technologie

- **Electron** - Cross-platform desktop framework
- **React** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool a dev server
- **Fabric.js** - Canvas manipulace a editor
- **TailwindCSS** - Utility-first CSS framework
- **XLSX** - Excel soubory čtení/zápis
- **OpenType.js** - Práce s fonty
- **Sharp** - Zpracování obrázků

## Niimbot protokol

Aplikace implementuje reverse-engineerovaný Niimbot protokol:

- **Packet struktura**: `[START][CMD][LENGTH][DATA...][CHECKSUM][END]`
- **START byte**: `0x55`
- **END byte**: `0xAA`
- **Checksum**: XOR všech bytů mezi START a CHECKSUM

### Podporované příkazy

- `0x01` - Connect/Initialize
- `0x40` - Get model info
- `0x44` - Get serial number
- `0x3E` - Get firmware version
- `0x50` - Get battery level
- `0x21` - Set print density
- `0x23` - Set label type
- `0x03` - Start print page
- `0xE3` - End print page
- `0x85` - Image data transfer

## Troubleshooting

### Tiskárna se nenajde

1. Ujistěte se, že je tiskárna zapnutá a nabita
2. Zkontrolujte, zda je Bluetooth zapnutý na vašem zařízení
3. Zkuste restartovat tiskárnu
4. Na macOS: zkontrolujte, že má aplikace oprávnění k Bluetooth

### Tisk nefunguje

1. Zkontrolujte připojení k tiskárně
2. Ujistěte se, že je v tiskárně papír
3. Zkuste snížit hustotu tisku
4. Restartujte aplikaci a tiskárnu

### Fonty se nenačítají

1. Podporované formáty: pouze .ttf a .otf
2. Zkontrolujte, že soubor není poškozený
3. Některé fonty mohou mít omezení licencí

## Alternativy

Pokud hledáte alternativy k této aplikaci:

- **Web verze**: Lze vytvořit jako PWA s WebBluetooth API
- **CLI nástroj**: Pro automatizaci z příkazové řádky
- **Plugin pro grafické editory**: Photoshop, GIMP, Inkscape

## Bezpečnost a soukromí

- ✅ Aplikace nekomunikuje s žádnými externími servery
- ✅ Všechna data zůstávají lokálně na vašem zařízení
- ✅ Žádné telemetrie ani analytika
- ✅ Open source - můžete si zkontrolovat kód

## Přispívání

Pull requesty jsou vítány! Pro větší změny nejdřív otevřete issue pro diskuzi.

## Licence

MIT License - viz LICENSE soubor

## Známé problémy

- **Bluetooth na Linuxu**: Může vyžadovat dodatečná oprávnění nebo noble/bluez setup
- **USB komunikace**: Zatím není plně implementována (pouze Bluetooth)
- **Vysoké rozlišení**: Na Retina/HiDPI displejích může být canvas menší než očekáváno

## Roadmap

- [ ] USB komunikace jako alternativa k Bluetooth
- [ ] Podpora pro QR kódy a čárové kódy
- [ ] Šablony pro běžné typy štítků
- [ ] Batch printing z CSV souborů
- [ ] Dark mode
- [ ] Lokalizace (angličtina, němčina atd.)
- [ ] Cloud sync pro designy

## Kontakt

Pro bug reporty a feature requesty použijte GitHub Issues.

---

Vytvořeno s ❤️ pro komunitu Niimbot uživatelů
