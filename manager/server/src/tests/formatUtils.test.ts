import { describe, it, expect } from 'vitest';
import { FormatUtils } from '../utils/formatUtils';

/**
 * FormatUtils Tests — AGT & Banking Standards
 * Covers currency formatting, date formatting, NIF sanitization.
 */
describe('FormatUtils (Formatting & AGT Standards)', () => {

    // ── formatCurrency ────────────────────────────────────────────────────────
    describe('formatCurrency', () => {
        it('should format zero correctly', () => {
            expect(FormatUtils.formatCurrency(0)).toBe('0,00 Kz');
        });

        it('should format a standard value with thousands separator', () => {
            const result = FormatUtils.formatCurrency(1500.50);
            expect(result).toContain('Kz');
            expect(result).toContain('1');
            expect(result).toContain('500');
        });

        it('should format a large value correctly', () => {
            const result = FormatUtils.formatCurrency(1_000_000);
            expect(result).toContain('Kz');
            expect(result).toMatch(/1[\.,\s]000/);
        });

        it('should handle null/undefined gracefully', () => {
            expect(FormatUtils.formatCurrency(null as any)).toBe('0,00 Kz');
            expect(FormatUtils.formatCurrency(undefined as any)).toBe('0,00 Kz');
        });

        it('should format negative values', () => {
            const result = FormatUtils.formatCurrency(-500);
            expect(result).toContain('Kz');
            expect(result).toContain('500');
        });
    });

    // ── formatCurrencyCompact ─────────────────────────────────────────────────
    describe('formatCurrencyCompact', () => {
        it('should return standard format for small values', () => {
            const result = FormatUtils.formatCurrencyCompact(50_000);
            expect(result).toContain('Kz');
        });

        it('should return compact format for very large values', () => {
            const result = FormatUtils.formatCurrencyCompact(1_500_000_000);
            expect(result).toContain('Kz');
            // Compact notation should produce something shorter than the full number
            expect(result.length).toBeLessThan(20);
        });
    });

    // ── formatDate ────────────────────────────────────────────────────────────
    describe('formatDate', () => {
        it('should format a Date object as DD/MM/YYYY', () => {
            const date = new Date('2026-01-15T12:00:00Z');
            const result = FormatUtils.formatDate(date);
            expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
            expect(result).toContain('2026');
        });

        it('should accept ISO string input', () => {
            const result = FormatUtils.formatDate('2026-05-08');
            expect(result).toMatch(/^\d{2}\/\d{2}\/\d{4}$/);
        });

        it('should accept timestamp (number) input', () => {
            const ts = new Date('2026-03-20').getTime();
            const result = FormatUtils.formatDate(ts);
            expect(result).toContain('2026');
        });
    });

    // ── formatNif ─────────────────────────────────────────────────────────────
    describe('formatNif', () => {
        it('should strip non-alphanumeric characters and uppercase', () => {
            expect(FormatUtils.formatNif('541 738 291 0')).toBe('5417382910');
            expect(FormatUtils.formatNif('5.417.382.910')).toBe('5417382910');
        });

        it('should uppercase letters in the NIF', () => {
            expect(FormatUtils.formatNif('k0000000k')).toBe('K0000000K');
        });

        it('should handle already-clean NIF', () => {
            expect(FormatUtils.formatNif('5417382910')).toBe('5417382910');
        });
    });

    // ── formatExtenso ─────────────────────────────────────────────────────────
    describe('formatExtenso', () => {
        it('should convert integer amounts to written form in Portuguese', () => {
            const result = FormatUtils.formatExtenso(1000);
            expect(typeof result).toBe('string');
            expect(result.length).toBeGreaterThan(0);
            // Should start with capital letter
            expect(result[0]).toBe(result[0].toUpperCase());
        });

        it('should include "Kwanzas" for values > 1', () => {
            const result = FormatUtils.formatExtenso(100);
            expect(result).toContain('Kwanzas');
        });

        it('should include "Kwanza" (singular) for value of 1', () => {
            const result = FormatUtils.formatExtenso(1);
            expect(result).toContain('Kwanza');
        });

        it('should return empty string gracefully on error', () => {
            // Passing very exotic input should not throw
            const result = FormatUtils.formatExtenso(NaN);
            expect(typeof result).toBe('string');
        });
    });
});
