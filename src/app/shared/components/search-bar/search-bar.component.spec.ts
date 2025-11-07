import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchBarComponent } from './search-bar.component';

describe('SearchBarComponent', () => {
  let component: SearchBarComponent;
  let fixture: ComponentFixture<SearchBarComponent>;
  let compiled: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SearchBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(SearchBarComponent);
    component = fixture.componentInstance;
    compiled = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render input with placeholder', () => {
    fixture.componentRef.setInput('placeholder', 'Search for jokes...');
    fixture.detectChanges();

    const input = compiled.querySelector('input');
    expect(input).toBeTruthy();
    expect(input?.placeholder).toBe('Search for jokes...');
  });

  it('should render button with SVG icon', () => {
    const button = compiled.querySelector('button');
    const svg = button?.querySelector('svg');
    
    expect(button).toBeTruthy();
    expect(svg).toBeTruthy();
    expect(svg?.getAttribute('width')).toBe('12');
    expect(svg?.getAttribute('height')).toBe('12');
  });

  it('should emit search event on form submit', () => {
    const searchSpy = jasmine.createSpy('search');
    component.search.subscribe(searchSpy);

    component.query.set('test query');
    fixture.detectChanges();

    const form = compiled.querySelector('form');
    const event = new Event('submit');
    form?.dispatchEvent(event);

    expect(searchSpy).toHaveBeenCalledWith('test query');
  });

  it('should emit search event on Enter key', () => {
    const searchSpy = jasmine.createSpy('search');
    component.search.subscribe(searchSpy);

    const input = compiled.querySelector('input') as HTMLInputElement;
    input.value = 'keyboard test';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    const form = compiled.querySelector('form');
    const submitEvent = new Event('submit');
    form?.dispatchEvent(submitEvent);

    expect(searchSpy).toHaveBeenCalledWith('keyboard test');
  });

  it('should update query signal on input', () => {
    const input = compiled.querySelector('input') as HTMLInputElement;
    
    input.value = 'new query';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();

    expect(component.query()).toBe('new query');
  });

  it('should disable input when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const input = compiled.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('should disable button when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    const button = compiled.querySelector('button') as HTMLButtonElement;
    expect(button.disabled).toBe(true);
  });

  it('should have proper aria-label on input', () => {
    fixture.componentRef.setInput('label', 'Search jokes');
    fixture.detectChanges();

    const input = compiled.querySelector('input');
    expect(input?.getAttribute('aria-label')).toBe('Search jokes');
  });

  it('should have proper aria-label on button', () => {
    const button = compiled.querySelector('button');
    expect(button?.getAttribute('aria-label')).toBe('Search');
  });

  it('should have visually hidden label for screen readers', () => {
    fixture.componentRef.setInput('label', 'Search');
    fixture.detectChanges();

    const label = compiled.querySelector('label');
    expect(label).toBeTruthy();
    expect(label?.textContent).toBe('Search');
    
    // Check that label has sr-only class
    const styles = window.getComputedStyle(label!);
    expect(label?.classList.contains('search-bar__label')).toBe(true);
  });

  it('should prevent default form submission', () => {
    const form = compiled.querySelector('form');
    const event = new Event('submit');
    const preventDefaultSpy = spyOn(event, 'preventDefault');
    
    form?.dispatchEvent(event);

    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('should emit empty string when submitting empty input', () => {
    const searchSpy = jasmine.createSpy('search');
    component.search.subscribe(searchSpy);

    component.query.set('');
    fixture.detectChanges();

    const form = compiled.querySelector('form');
    const event = new Event('submit');
    form?.dispatchEvent(event);

    expect(searchSpy).toHaveBeenCalledWith('');
  });
});
