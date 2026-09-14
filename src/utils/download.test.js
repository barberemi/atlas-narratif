import { describe, it, expect, vi, beforeEach } from 'vitest';
import { downloadBlob, openHtmlDocument } from './download';

beforeEach(() => {
  vi.restoreAllMocks();
  global.URL.createObjectURL = vi.fn().mockReturnValue('blob:fake-url');
  global.URL.revokeObjectURL = vi.fn();
});

describe('downloadBlob', () => {
  it('crée un <a download> et le clique avec le bon nom de fichier', () => {
    const fakeA = { href: '', download: '', click: vi.fn() };
    vi.spyOn(document, 'createElement').mockReturnValue(fakeA);

    downloadBlob('contenu', 'monfichier.txt');

    expect(fakeA.download).toBe('monfichier.txt');
    expect(fakeA.href).toBe('blob:fake-url');
    expect(fakeA.click).toHaveBeenCalledOnce();
  });

  it("révoque l'URL blob après le clic", () => {
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });

    downloadBlob('contenu', 'f.txt');

    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
  });

  it('applique le type MIME par défaut (text/plain)', () => {
    let captured;
    const OrigBlob = global.Blob;
    global.Blob = class { constructor(parts, opts) { captured = opts; } };
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });

    downloadBlob('contenu', 'f.txt');
    global.Blob = OrigBlob;

    expect(captured.type).toBe('text/plain;charset=utf-8');
  });

  it('accepte un type MIME personnalisé', () => {
    let captured;
    const OrigBlob = global.Blob;
    global.Blob = class { constructor(parts, opts) { captured = opts; } };
    vi.spyOn(document, 'createElement').mockReturnValue({ href: '', download: '', click: vi.fn() });

    downloadBlob('# md', 'f.md', 'text/markdown;charset=utf-8');
    global.Blob = OrigBlob;

    expect(captured.type).toBe('text/markdown;charset=utf-8');
  });
});

describe('openHtmlDocument', () => {
  it('ouvre un nouvel onglet sur une URL blob et retourne la fenêtre', () => {
    vi.useFakeTimers();
    const fakeWin = {};
    global.window.open = vi.fn().mockReturnValue(fakeWin);

    const win = openHtmlDocument('<html></html>');

    expect(window.open).toHaveBeenCalledWith('blob:fake-url', '_blank');
    expect(win).toBe(fakeWin);

    // L'URL n'est révoquée qu'après le délai (laisse le temps au chargement).
    expect(URL.revokeObjectURL).not.toHaveBeenCalled();
    vi.runAllTimers();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:fake-url');
    vi.useRealTimers();
  });

  it('retourne null si le popup est bloqué', () => {
    global.window.open = vi.fn().mockReturnValue(null);
    expect(openHtmlDocument('<html></html>')).toBeNull();
  });
});
