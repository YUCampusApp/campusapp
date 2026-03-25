/** GPA display: >3.5 celebration emoji, >3 green, <3 red; exactly 3 uses neutral blue. */
export function gpaColor(gpa: number): string {
  if (gpa < 3) return 'var(--campus-danger)'
  if (gpa > 3) return 'var(--campus-success)'
  return 'var(--campus-blue)'
}

export function gpaCelebrationEmoji(gpa: number): string {
  return gpa > 3.5 ? '🎉' : ''
}
