import { JSDOM } from 'jsdom';
import DOMTagger from '../../core/tagger';

// Mock performance API for testing
const mockPerformance = {
  now: jest.fn(),
  memory: {
    usedJSHeapSize: 5242880, // 5MB in bytes
    totalJSHeapSize: 10485760,
    jsHeapSizeLimit: 2147483648
  }
};

describe('DOMTagger', () => {
  let dom: JSDOM;
  let document: Document;
  let tagger: DOMTagger;

  beforeEach(() => {
    // Set up performance mock before JSDOM
    // @ts-ignore
    global.performance = mockPerformance;
    
    // Reset performance.now mock
    mockPerformance.now.mockClear();
    
    dom = new JSDOM('<!DOCTYPE html><html><body></body></html>');
    document = dom.window.document;
    // @ts-ignore
    global.document = document;
    // @ts-ignore
    global.HTMLElement = dom.window.HTMLElement;
    
    tagger = new DOMTagger({ selectors: ['input', 'button', 'span', 'a', 'select', 'textarea', "div[role='switch']", "div[role='slider']", "div[role='option']"] });
  });

  afterEach(() => {
    // @ts-ignore
    delete global.document;
    // @ts-ignore
    delete global.performance;
  });

  describe('determineType', () => {
    it('returns "checkbox" for input[type="checkbox"]', () => {
      const el = document.createElement('input');
      el.setAttribute('type', 'checkbox');
      // @ts-ignore
      expect(tagger['determineType'](el)).toBe('checkbox');
    });
    it('returns "radio-button" for input[type="radio"]', () => {
      const el = document.createElement('input');
      el.setAttribute('type', 'radio');
      // @ts-ignore
      expect(tagger['determineType'](el)).toBe('radio-button');
    });
    it('returns "stepper" for input[type="number"].quantity', () => {
      const el = document.createElement('input');
      el.setAttribute('type', 'number');
      el.className = 'quantity';
      // @ts-ignore
      expect(tagger['determineType'](el)).toBe('stepper');
    });
    it('returns "toggle" for button.toggle', () => {
      const el = document.createElement('button');
      el.className = 'toggle';
      // @ts-ignore
      expect(tagger['determineType'](el)).toBe('toggle');
    });
    it('returns "dropdown" for select', () => {
      const el = document.createElement('select');
      // @ts-ignore
      expect(tagger['determineType'](el)).toBe('dropdown');
    });
    it('returns "switch" for div[role="switch"]', () => {
      const el = document.createElement('div');
      el.setAttribute('role', 'switch');
      // @ts-ignore
      expect(tagger['determineType'](el)).toBe('switch');
    });
  });

  describe('action/context inference', () => {
    it('uses aria-label for action', () => {
      const el = document.createElement('button');
      el.setAttribute('aria-label', 'Submit Form');
      // @ts-ignore
      expect(tagger['determineAction'](el)).toBe('Submit Form');
    });
    it('uses textContent for action if no aria-label', () => {
      const el = document.createElement('button');
      el.textContent = 'Delete';
      // @ts-ignore
      expect(tagger['determineAction'](el)).toBe('Delete');
    });
    it('uses parent context for context', () => {
      const parent = document.createElement('div');
      parent.className = 'hero';
      const el = document.createElement('button');
      parent.appendChild(el);
      document.body.appendChild(parent);
      // @ts-ignore
      expect(tagger['determineContext'](el)).toBe('hero');
    });
  });

  describe('selector matching', () => {
    it('tags only elements matching selectors', () => {
      const btn = document.createElement('button');
      const div = document.createElement('div');
      document.body.appendChild(btn);
      document.body.appendChild(div);
      tagger['tagExistingElements']();
      expect(btn.hasAttribute('data-type')).toBe(true);
      expect(div.hasAttribute('data-type')).toBe(false);
    });
  });

  describe('data-value functionality', () => {
    it('sets data-value for input[type="number"] with valid number', () => {
      const el = document.createElement('input');
      el.setAttribute('type', 'number');
      (el as HTMLInputElement).value = '42';
      document.body.appendChild(el);
      tagger['tagExistingElements']();
      expect(el.getAttribute('data-value')).toBe('42');
    });

    it('does not set data-value for input[type="number"] with invalid number', () => {
      const el = document.createElement('input');
      el.setAttribute('type', 'number');
      (el as HTMLInputElement).value = 'not-a-number';
      document.body.appendChild(el);
      tagger['tagExistingElements']();
      expect(el.getAttribute('data-value')).toBeNull();
    });

    it('sets data-value for select with numeric options', () => {
      const el = document.createElement('select');
      const option1 = document.createElement('option');
      option1.value = '1';
      option1.textContent = 'One';
      const option2 = document.createElement('option');
      option2.value = '2';
      option2.textContent = 'Two';
      el.appendChild(option1);
      el.appendChild(option2);
      (el as HTMLSelectElement).value = '2';
      document.body.appendChild(el);
      tagger['tagExistingElements']();
      expect(el.getAttribute('data-value')).toBe('2');
    });

    it('sets data-value for custom dropdown with role="option"', () => {
      const el = document.createElement('div');
      el.setAttribute('role', 'option');
      el.setAttribute('aria-selected', 'true');
      el.textContent = '5';
      document.body.appendChild(el);
      tagger['tagExistingElements']();
      expect(el.getAttribute('data-value')).toBe('5');
    });

    it('does not set data-value for non-numeric elements', () => {
      const el = document.createElement('button');
      el.textContent = 'Click me';
      document.body.appendChild(el);
      tagger['tagExistingElements']();
      expect(el.getAttribute('data-value')).toBeNull();
    });
  });

  describe('data-value numeric logic', () => {
    it('sets data-value for input[type="number"] with valid number', () => {
      const el = document.createElement('input');
      el.setAttribute('type', 'number');
      (el as HTMLInputElement).value = '99';
      document.body.appendChild(el);
      tagger['tagExistingElements']();
      expect(el.getAttribute('data-value')).toBe('99');
    });

    it('does not set data-value for input[type="number"] with invalid value', () => {
      const el = document.createElement('input');
      el.setAttribute('type', 'number');
      (el as HTMLInputElement).value = 'not-a-number';
      document.body.appendChild(el);
      tagger['tagExistingElements']();
      expect(el.getAttribute('data-value')).toBeNull();
    });

    it('sets data-value for stepper (input[type="number"].quantity)', () => {
      const el = document.createElement('input');
      el.setAttribute('type', 'number');
      el.className = 'quantity';
      (el as HTMLInputElement).value = '7';
      document.body.appendChild(el);
      tagger['tagExistingElements']();
      expect(el.getAttribute('data-value')).toBe('7');
    });

    it('sets data-value for custom dropdown li with numeric data-value and selected', () => {
      const ul = document.createElement('ul');
      ul.setAttribute('role', 'presentation');
      const li = document.createElement('li');
      li.setAttribute('data-value', '15');
      li.setAttribute('aria-selected', 'true');
      li.className = 'selected';
      ul.appendChild(li);
      document.body.appendChild(ul);
      tagger['tagExistingElements']();
      expect(li.getAttribute('data-value')).toBe('15');
    });

    it('does not set data-value for custom dropdown li if not selected', () => {
      const ul = document.createElement('ul');
      ul.setAttribute('role', 'presentation');
      const li = document.createElement('li');
      li.setAttribute('data-value', '20');
      ul.appendChild(li);
      document.body.appendChild(ul);
      tagger['tagExistingElements']();
      // Should not set data-value attribute again (already present, but not as a tag)
      // So we check that no new attribute is added or changed
      expect(li.getAttribute('data-value')).toBe('20');
    });

    it('does not set data-value for non-numeric li in custom dropdown', () => {
      const ul = document.createElement('ul');
      ul.setAttribute('role', 'presentation');
      const li = document.createElement('li');
      li.setAttribute('data-value', 'not-a-number');
      li.setAttribute('aria-selected', 'true');
      li.className = 'selected';
      ul.appendChild(li);
      document.body.appendChild(ul);
      tagger['tagExistingElements']();
      // Should not set data-value as a tag
      expect(li.getAttribute('data-value')).toBe('not-a-number');
    });
  });

  describe('edge cases', () => {
    it('does not overwrite manually set data-type', () => {
      const el = document.createElement('button');
      el.setAttribute('data-type', 'custom');
      document.body.appendChild(el);
      tagger['tagExistingElements']();
      expect(el.getAttribute('data-type')).toBe('custom');
    });
    it('handles deeply nested elements', () => {
      const outer = document.createElement('div');
      const inner = document.createElement('div');
      const btn = document.createElement('button');
      inner.appendChild(btn);
      outer.appendChild(inner);
      document.body.appendChild(outer);
      tagger['tagExistingElements']();
      expect(btn.hasAttribute('data-type')).toBe(true);
    });
  });

  describe('error handling', () => {
    it('handles malformed elements gracefully', () => {
      const el = document.createElement('button');
      // Simulate a corrupted element by removing critical properties
      Object.defineProperty(el, 'tagName', { value: null });
      
      // @ts-ignore - Testing error scenario
      const result = tagger['determineType'](el);
      expect(result).toBe('unknown'); // Should fallback gracefully when tagName is corrupted
    });

    it('continues tagging when one element fails', () => {
      const btn1 = document.createElement('button');
      const btn2 = document.createElement('button');
      // Corrupt btn1 but leave btn2 normal
      Object.defineProperty(btn1, 'setAttribute', { value: () => { throw new Error('DOM Error'); } });
      
      document.body.appendChild(btn1);
      document.body.appendChild(btn2);
      
      tagger['tagExistingElements']();
      expect(btn2.hasAttribute('data-type')).toBe(true);
    });
  });

  describe('event handling', () => {
    it('sets up click listeners on init', () => {
      const addEventListenerSpy = jest.spyOn(document, 'addEventListener');
      tagger.init();
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('click', expect.any(Function), true);
      expect(addEventListenerSpy).toHaveBeenCalledWith('change', expect.any(Function), true);
    });

    it('tags elements on click', () => {
      const btn = document.createElement('button');
      btn.textContent = 'Test Button';
      document.body.appendChild(btn);
      
      tagger.init();
      
      // Simulate click event
      const clickEvent = new dom.window.MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: btn });
      
      btn.dispatchEvent(clickEvent);
      
      expect(btn.hasAttribute('data-type')).toBe(true);
      expect(btn.getAttribute('data-action')).toBe('Test Button');
    });
  });

  describe('public API', () => {
    it('getStats returns accurate counts', () => {
      const btn1 = document.createElement('button');
      const btn2 = document.createElement('button');
      const link = document.createElement('a');
      
      document.body.appendChild(btn1);
      document.body.appendChild(btn2);
      document.body.appendChild(link);
      
      tagger['tagExistingElements']();
      const stats = tagger.getStats();
      
      expect(stats.total).toBe(3);
      expect(stats.tagged).toBe(3);
      expect(stats.types.button).toBe(2);
      expect(stats.types.link).toBe(1);
    });

    it('clearTags removes all attributes', () => {
      const btn = document.createElement('button');
      document.body.appendChild(btn);
      
      tagger['tagExistingElements']();
      expect(btn.hasAttribute('data-type')).toBe(true);
      
      tagger.clearTags();
      expect(btn.hasAttribute('data-type')).toBe(false);
    });
  });

  describe('analytics integration', () => {
    beforeEach(() => {
      // @ts-ignore
      global.window = dom.window;
      // @ts-ignore
      global.window.dataLayer = [];
    });

    it('pushes analytics data on click', () => {
      const btn = document.createElement('button');
      btn.textContent = 'Analytics Test';
      btn.setAttribute('data-type', 'button');
      btn.setAttribute('data-action', 'Analytics Test');
      btn.setAttribute('data-context', 'main-content');
      document.body.appendChild(btn);
      
      tagger.init();
      
      // Simulate click
      const clickEvent = new dom.window.MouseEvent('click', { bubbles: true });
      Object.defineProperty(clickEvent, 'target', { value: btn });
      
      // @ts-ignore - Access private method for testing
      tagger['extractAndPushAnalytics'](btn);
      
      // @ts-ignore - Should have performance event + click event
      expect(global.window.dataLayer).toHaveLength(2);
      // @ts-ignore - First event should be performance
      expect(global.window.dataLayer[0].event).toBe('tagger_performance');
      // @ts-ignore - Second event should be click
      expect(global.window.dataLayer[1].event).toBe('click_event');
    });
  });

  describe('performance tracking', () => {
    it('captures performance metrics on init', () => {
      // Mock performance.now to return predictable values
      mockPerformance.now
        .mockReturnValueOnce(100) // Start time
        .mockReturnValueOnce(150); // End time
      
      const btn = document.createElement('button');
      btn.textContent = 'Test Button';
      document.body.appendChild(btn);
      
      tagger.init();
      
      const metrics = tagger.getPerformanceMetrics();
      expect(metrics).not.toBeNull();
      expect(metrics!.init_time_ms).toBe(50); // 150 - 100
      expect(metrics!.total_elements_tagged).toBe(1);
      expect(metrics!.total_page_memory_mb).toBe(5); // 5MB from mock
      expect(typeof metrics!.timestamp).toBe('number');
    });

    it('sends performance event on init', () => {
      mockPerformance.now
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(150);
      
      const btn = document.createElement('button');
      document.body.appendChild(btn);
      
      // @ts-ignore
      global.window = dom.window;
      // @ts-ignore
      global.window.dataLayer = [];
      
      tagger.init();
      
      // @ts-ignore
      expect(global.window.dataLayer).toHaveLength(1);
      // @ts-ignore
      const performanceEvent = global.window.dataLayer[0];
      expect(performanceEvent.event).toBe('tagger_performance');
      expect(performanceEvent.performance.init_time_ms).toBe(50);
      expect(performanceEvent.performance.total_elements_tagged).toBe(1);
    });

    it('handles memory API unavailable gracefully', () => {
      // Mock performance without memory property
      // @ts-ignore
      global.performance = { now: mockPerformance.now };
      mockPerformance.now
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(150);
      
      tagger.init();
      
      const metrics = tagger.getPerformanceMetrics();
      expect(metrics!.total_page_memory_mb).toBe(0);
    });

    it('rounds performance metrics to 2 decimal places', () => {
      mockPerformance.now
        .mockReturnValueOnce(100.123456)
        .mockReturnValueOnce(150.987654);
      
      tagger.init();
      
      const metrics = tagger.getPerformanceMetrics();
      expect(metrics!.init_time_ms).toBe(50.86); // Rounded from 50.864198
    });

    it('returns null performance metrics before init', () => {
      const metrics = tagger.getPerformanceMetrics();
      expect(metrics).toBeNull();
    });
  });

  describe('separate performance and click events', () => {
    beforeEach(() => {
      // @ts-ignore
      global.window = dom.window;
      // @ts-ignore
      global.window.dataLayer = [];
      
      mockPerformance.now
        .mockReturnValueOnce(100)
        .mockReturnValueOnce(150);
    });

    it('sends performance event on init, click events separately', () => {
      const btn1 = document.createElement('button');
      btn1.textContent = 'First Button';
      btn1.setAttribute('data-type', 'button');
      btn1.setAttribute('data-action', 'First Button');
      btn1.setAttribute('data-context', 'main-content');
      
      const btn2 = document.createElement('button');
      btn2.textContent = 'Second Button';
      btn2.setAttribute('data-type', 'button');
      btn2.setAttribute('data-action', 'Second Button');
      btn2.setAttribute('data-context', 'main-content');
      
      document.body.appendChild(btn1);
      document.body.appendChild(btn2);
      
      tagger.init();
      
      // Simulate first click
      // @ts-ignore - Access private method for testing
      tagger['extractAndPushAnalytics'](btn1);
      
      // Simulate second click
      // @ts-ignore - Access private method for testing
      tagger['extractAndPushAnalytics'](btn2);
      
      // @ts-ignore - Should have 1 performance + 2 click events
      expect(global.window.dataLayer).toHaveLength(3);
      
      // First event should be performance
      // @ts-ignore
      const performanceEvent = global.window.dataLayer[0];
      expect(performanceEvent.event).toBe('tagger_performance');
      expect(performanceEvent.performance.init_time_ms).toBe(50);
      expect(performanceEvent.performance.total_elements_tagged).toBe(2);
      
      // Subsequent events should be click events only
      // @ts-ignore
      const firstClickEvent = global.window.dataLayer[1];
      expect(firstClickEvent.event).toBe('click_event');
      expect(firstClickEvent.page_performance).toBeUndefined();
      
      // @ts-ignore
      const secondClickEvent = global.window.dataLayer[2];
      expect(secondClickEvent.event).toBe('click_event');
      expect(secondClickEvent.page_performance).toBeUndefined();
    });

    it('handles performance metrics failure gracefully', () => {
      // Remove performance API entirely to simulate failure
      // @ts-ignore
      delete global.performance;
      
      const btn = document.createElement('button');
      document.body.appendChild(btn);
      
      // Should not throw
      expect(() => tagger.init()).not.toThrow();
      
      const metrics = tagger.getPerformanceMetrics();
      expect(metrics).toBeNull();
    });
  });
}); 