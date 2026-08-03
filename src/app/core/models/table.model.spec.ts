import { tableLabel } from './table.model';

describe('tableLabel', () => {
  it('prefers a configured table name', () => {
    expect(tableLabel({ id: 'table-1', number: 4, name: 'Terraza' })).toBe('Terraza');
  });

  it('shows the operational table number instead of its id', () => {
    expect(tableLabel({ id: '64c88b32-5594-4e12-b788-d41fd9cd40d8', number: 4 })).toBe('Mesa 4');
  });

  it('does not expose the id when the table number is missing', () => {
    expect(tableLabel({ id: '64c88b32-5594-4e12-b788-d41fd9cd40d8' })).toBe('Mesa sin número');
  });
});
