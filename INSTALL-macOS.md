# Instalace na macOS

## Rychlý start

```bash
# Instalace závislostí
npm install

# Spuštění aplikace
npm run electron:dev
```

To je vše! Aplikace by měla běžet bez problémů.

## Řešení problémů

### Chyba při instalaci

Pokud se během `npm install` objeví chyba, zkuste:

```bash
# Vyčistit npm cache
npm cache clean --force

# Smazat node_modules
rm -rf node_modules package-lock.json

# Znovu instalovat
npm install
```

### Electron builder na Apple Silicon

Na macOS s Apple Silicon (M1/M2/M3) může být potřeba nastavit správnou architekturu:

```bash
# Pro build universal binary (Intel + ARM)
npm run build:mac

# Výsledek najdete v dist/ složce
```

## Node.js verze

Doporučená verze Node.js: **18.x nebo 20.x**

Pokud používáte Node.js 22, může dojít k problémům s některými závislostmi. Doporučuji použít Node.js 20 LTS:

```bash
# Pomocí nvm
nvm install 20
nvm use 20

# Pak instalovat závislosti
npm install
```

## Systémové požadavky

- **macOS**: 10.13 nebo novější
- **Node.js**: 18.x nebo 20.x (LTS)
- **npm**: 8.x nebo novější

## Poznámky pro vývojáře

### Hot reload

V dev módu (`npm run electron:dev`) je automaticky zapnutý hot reload:
- Změny v React komponentách se projeví okamžitě
- Změny v Electron main process vyžadují restart

### Debugging

Pro otevření Chrome DevTools:
- V dev módu se otevřou automaticky
- Nebo stiskněte `Cmd+Option+I`

### Build

Build proces:
1. TypeScript kompilace
2. Vite build (React frontend)
3. Electron Builder (balíčkování)

Výstup:
- **DMG**: instalátor pro macOS
- **ZIP**: přenosná verze (stačí rozbalit a spustit)

---

Pokud máte problémy, otevřete issue na GitHubu.
