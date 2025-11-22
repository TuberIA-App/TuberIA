import { describe, it, expect } from 'vitest';
import { processTranscript, validateTranscript } from '../../../services/ai/transcriptionProcessor.js';

describe('Transcription Processor', () => {
    describe('processTranscript', () => {
        it('should process valid transcript array into clean text', () => {
            const transcript = [
                { text: 'Hello everyone,', duration: 2, offset: 0, lang: 'en' },
                { text: 'welcome to this video.', duration: 3, offset: 2, lang: 'en' },
                { text: 'Today we discuss AI.', duration: 2.5, offset: 5, lang: 'en' }
            ];

            const result = processTranscript(transcript);

            expect(result).toBe('Hello everyone, welcome to this video. Today we discuss AI.');
        });

        it('should normalize multiple spaces into single spaces', () => {
            const transcript = [
                { text: 'Hello    world', duration: 2, offset: 0, lang: 'en' },
                { text: 'with   extra    spaces', duration: 3, offset: 2, lang: 'en' }
            ];

            const result = processTranscript(transcript);

            expect(result).toBe('Hello world with extra spaces');
            expect(result).not.toContain('  '); // No double spaces
        });

        it('should filter out empty text segments', () => {
            const transcript = [
                { text: 'Valid text', duration: 2, offset: 0, lang: 'en' },
                { text: '', duration: 1, offset: 2, lang: 'en' }, // Empty
                { text: '   ', duration: 1, offset: 3, lang: 'en' }, // Only whitespace
                { text: 'More valid text', duration: 2, offset: 4, lang: 'en' }
            ];

            const result = processTranscript(transcript);

            expect(result).toBe('Valid text More valid text');
        });

        it('should trim leading and trailing whitespace', () => {
            const transcript = [
                { text: '  Hello  ', duration: 2, offset: 0, lang: 'en' },
                { text: '  world  ', duration: 2, offset: 2, lang: 'en' }
            ];

            const result = processTranscript(transcript);

            expect(result).toBe('Hello world');
            expect(result[0]).not.toBe(' '); // No leading space
            expect(result[result.length - 1]).not.toBe(' '); // No trailing space
        });

        it('should return empty string for empty array', () => {
            const result = processTranscript([]);

            expect(result).toBe('');
        });

        it('should return empty string for non-array input', () => {
            expect(processTranscript(null)).toBe('');
            expect(processTranscript(undefined)).toBe('');
            expect(processTranscript('not an array')).toBe('');
            expect(processTranscript(123)).toBe('');
            expect(processTranscript({})).toBe('');
        });

        it('should handle transcript with special characters', () => {
            const transcript = [
                { text: '¿Hola, cómo estás?', duration: 2, offset: 0, lang: 'es' },
                { text: 'Très bien, merci!', duration: 2, offset: 2, lang: 'fr' },
                { text: 'Hello & goodbye', duration: 2, offset: 4, lang: 'en' }
            ];

            const result = processTranscript(transcript);

            expect(result).toBe('¿Hola, cómo estás? Très bien, merci! Hello & goodbye');
        });

        it('should handle large transcript arrays efficiently', () => {
            const largeTranscript = Array.from({ length: 1000 }, (_, i) => ({
                text: `Segment ${i + 1} content`,
                duration: 2,
                offset: i * 2,
                lang: 'en'
            }));

            const result = processTranscript(largeTranscript);

            expect(result.length).toBeGreaterThan(0);
            expect(result).toContain('Segment 1 content');
            expect(result).toContain('Segment 1000 content');
        });

        it('should handle segments without text property gracefully', () => {
            const transcript = [
                { text: 'Valid segment', duration: 2, offset: 0, lang: 'en' },
                { duration: 2, offset: 2, lang: 'en' }, // Missing text
                { text: 'Another valid segment', duration: 2, offset: 4, lang: 'en' }
            ];

            // Should not throw error, just skip invalid segments
            const result = processTranscript(transcript);

            expect(result).toBe('Valid segment Another valid segment');
        });

        it('should handle newlines and special whitespace characters', () => {
            const transcript = [
                { text: 'Line 1\nLine 2', duration: 2, offset: 0, lang: 'en' },
                { text: 'Tab\tseparated', duration: 2, offset: 2, lang: 'en' }
            ];

            const result = processTranscript(transcript);

            // Newlines and tabs should be normalized to single spaces
            expect(result).not.toContain('\n');
            expect(result).not.toContain('\t');
            expect(result).toBe('Line 1 Line 2 Tab separated');
        });
    });

    describe('validateTranscript', () => {
        it('should return true for valid transcript array', () => {
            const transcript = [
                { text: 'Valid segment', duration: 2, offset: 0, lang: 'en' },
                { text: 'Another valid segment', duration: 3, offset: 2, lang: 'en' }
            ];

            expect(validateTranscript(transcript)).toBe(true);
        });

        it('should return false for empty array', () => {
            expect(validateTranscript([])).toBe(false);
        });

        it('should return false for non-array input', () => {
            expect(validateTranscript(null)).toBe(false);
            expect(validateTranscript(undefined)).toBe(false);
            expect(validateTranscript('not an array')).toBe(false);
            expect(validateTranscript(123)).toBe(false);
            expect(validateTranscript({})).toBe(false);
        });

        it('should return false if segments are missing text property', () => {
            const transcript = [
                { duration: 2, offset: 0, lang: 'en' }, // Missing text
                { duration: 3, offset: 2, lang: 'en' }
            ];

            expect(validateTranscript(transcript)).toBe(false);
        });

        it('should return false if text property is not a string', () => {
            const transcript = [
                { text: 123, duration: 2, offset: 0, lang: 'en' }, // text is number
                { text: 'Valid', duration: 3, offset: 2, lang: 'en' }
            ];

            expect(validateTranscript(transcript)).toBe(false);
        });

        it('should validate only first 5 segments for efficiency', () => {
            // Create array with valid first 5 items, but invalid 6th item
            const transcript = [
                { text: 'Segment 1', duration: 2, offset: 0, lang: 'en' },
                { text: 'Segment 2', duration: 2, offset: 2, lang: 'en' },
                { text: 'Segment 3', duration: 2, offset: 4, lang: 'en' },
                { text: 'Segment 4', duration: 2, offset: 6, lang: 'en' },
                { text: 'Segment 5', duration: 2, offset: 8, lang: 'en' },
                { duration: 2, offset: 10, lang: 'en' } // Missing text (6th item, should not be checked)
            ];

            // Should return true because only first 5 are validated
            expect(validateTranscript(transcript)).toBe(true);
        });

        it('should validate all segments if array has less than 5 items', () => {
            const transcript = [
                { text: 'Valid 1', duration: 2, offset: 0, lang: 'en' },
                { text: 'Valid 2', duration: 2, offset: 2, lang: 'en' },
                { duration: 2, offset: 4, lang: 'en' } // Missing text (3rd item)
            ];

            // Should return false because 3rd item is invalid
            expect(validateTranscript(transcript)).toBe(false);
        });

        it('should return false if first segment is null or undefined', () => {
            expect(validateTranscript([null])).toBe(false);
            expect(validateTranscript([undefined])).toBe(false);
            expect(validateTranscript([null, { text: 'Valid', duration: 2 }])).toBe(false);
        });

        it('should accept segments with empty text strings', () => {
            // Note: Empty strings are technically valid strings
            const transcript = [
                { text: '', duration: 2, offset: 0, lang: 'en' },
                { text: 'Valid', duration: 2, offset: 2, lang: 'en' }
            ];

            // Should return true because text property exists and is a string (even if empty)
            expect(validateTranscript(transcript)).toBe(true);
        });

        it('should not require other properties besides text', () => {
            // Minimal valid transcript (only text property required for validation)
            const transcript = [
                { text: 'Minimal segment' }
            ];

            expect(validateTranscript(transcript)).toBe(true);
        });
    });
});
