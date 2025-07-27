/**
 * Core DOM attribute tagging logic
 * Automatically adds data-type, data-action, data-context, and data-value attributes to interactive elements
 */
 
import { TaggerConfig, TaggedElement, AnalyticsData, DataLayerEvent, PagePerformanceMetrics, PerformanceEvent } from './types';

export class DOMTagger {
  private config: TaggerConfig;
  private defaultSelectors = ['a', 'button', 'span'];
  private defaultAttributes = {
    type: 'data-type',
    action: 'data-action',
    context: 'data-context',
    value: 'data-value'
  };
  private clickHandler: (event: MouseEvent) => void;
  private changeHandler: (event: Event) => void;
  private performanceMetrics: PagePerformanceMetrics | null = null;

  constructor(config: TaggerConfig = {}) {
    this.config = {
      selectors: config.selectors || this.defaultSelectors,
      attributes: { ...this.defaultAttributes, ...config.attributes },
      debug: config.debug || false
    };
    
    // Bind the click handler
    this.clickHandler = this.handleClick.bind(this);
    this.changeHandler = this.handleChange.bind(this);
  }

  /**
   * Initialize the tagger and start observing DOM changes
   */
  public init(): void {
    try {
      const startTime = performance.now();
      
      if (this.config.debug) {
        console.log('DOM Tagger initialized with click-based detection');
      }
      
      this.tagExistingElements();
      this.setupClickListener();
      this.setupChangeListener();
      
      // Capture performance metrics
      const endTime = performance.now();
      this.performanceMetrics = {
        init_time_ms: Math.round((endTime - startTime) * 100) / 100, // Round to 2 decimal places
        total_elements_tagged: this.getTaggedElements().length,
        total_page_memory_mb: this.getMemoryUsage(),
        timestamp: Date.now()
      };
      
      // Send performance event immediately
      this.pushPerformanceEvent();
      
      if (this.config.debug) {
        console.log('[DOM Tagger] Performance metrics:', this.performanceMetrics);
      }
    } catch (error) {
      console.error('[DOM Tagger] Initialization failed:', error);
      // Continue execution - don't throw to prevent breaking the host application
    }
  }

  /**
   * Tag all existing elements that match selectors
   */
  private tagExistingElements(): void {
    try {
      const elements = document.querySelectorAll(this.config.selectors!.join(','));
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          this.tagElement(element);
        }
      });
    } catch (error) {
      console.warn('[DOM Tagger] Failed to tag existing elements:', error);
      // Continue execution - partial tagging is better than no tagging
    }
  }

  /**
   * Tag a single element with appropriate data attributes
   */
  private tagElement(element: HTMLElement): TaggedElement {
    try {
      // Skip if already tagged
      if (this.isElementTagged(element)) {
        return this.getTaggedElement(element);
      }

      const type = this.determineType(element);
      const action = this.determineAction(element);
      const context = this.determineContext(element);
      const value = this.determineValue(element);

      // Set data attributes
      if (!element.hasAttribute(this.config.attributes!.type!)) {
        element.setAttribute(this.config.attributes!.type!, type);
      }
      if (!element.hasAttribute(this.config.attributes!.action!)) {
        element.setAttribute(this.config.attributes!.action!, action);
      }
      if (!element.hasAttribute(this.config.attributes!.context!)) {
        element.setAttribute(this.config.attributes!.context!, context);
      }
      if (value !== null && !element.hasAttribute(this.config.attributes!.value!)) {
        element.setAttribute(this.config.attributes!.value!, value);
      }

      return { element, type, action, context, value: value || '' };
    } catch (error) {
      console.warn('[DOM Tagger] Failed to tag element:', element, error);
      // Return a fallback tagged element to maintain consistency
      return {
        element,
        type: element.tagName.toLowerCase(),
        action: 'unknown-element',
        context: 'main-content',
        value: ''
      };
    }
  }

  /**
   * Check if element already has all required data attributes
   */
  private isElementTagged(element: HTMLElement): boolean {
    return element.hasAttribute(this.config.attributes!.type!) &&
           element.hasAttribute(this.config.attributes!.action!) &&
           element.hasAttribute(this.config.attributes!.context!);
  }

  /**
   * Get existing tagged element data
   */
  private getTaggedElement(element: HTMLElement): TaggedElement {
    return {
      element,
      type: element.getAttribute(this.config.attributes!.type!) || '',
      action: element.getAttribute(this.config.attributes!.action!) || '',
      context: element.getAttribute(this.config.attributes!.context!) || '',
      value: element.getAttribute(this.config.attributes!.value!) || ''
    };
  }

  /**
   * Determine the type - simple tag-based for v1
   */
  private determineType(element: HTMLElement): string {
    try {
      const tag = element.tagName.toLowerCase();

      if (tag === 'input') {
        const inputType = element.getAttribute('type') || '';
        if (inputType === 'checkbox') return 'checkbox';
        if (inputType === 'radio') return 'radio-button';
        if (inputType === 'text') return 'text-input';
        if (inputType === 'number') return 'stepper';
        if (inputType === 'range') return 'slider';
        if (inputType === 'file') return 'file-upload';
        return 'input';
      }

      if (tag === 'select') return 'dropdown';
      if (tag === 'textarea') return 'textarea';

      const role = element.getAttribute('role');
      if (role === 'switch') return 'switch';
      if (role === 'slider') return 'slider';

      const classList = element.className.toLowerCase();
      if (classList.includes('quantity')) return 'stepper';
      if (classList.includes('toggle')) return 'toggle';

      if (tag === 'a') return 'link';
      if (tag === 'button') return 'button';
      if (tag === 'span') return 'span';

      return tag;
    } catch (error) {
      console.warn('[DOM Tagger] Type determination failed for element:', element, error);
      try {
        return element.tagName.toLowerCase(); // Fallback to tag name
      } catch {
        return 'unknown'; // Ultimate fallback if tagName is also corrupted
      }
    }
  }

  /**
   * Determine context based on page structure, semantic sections, and absolute page position
   */
  private determineContext(element: HTMLElement): string {
    try {
      let current = element;
      let context: string | null = null;
      // Walk up the DOM tree for semantic/class-based context
      while (current && current !== document.body) {
        const parent = current.parentElement;
        if (!parent) break;
        const parentTag = parent.tagName.toLowerCase();
        if (parentTag === 'header') { context = 'header'; break; }
        if (parentTag === 'footer') { context = 'footer'; break; }
        if (parentTag === 'nav') { context = 'navigation'; break; }
        if (parentTag === 'aside') { context = 'sidebar'; break; }
        const classes = parent.className.toLowerCase();
        if (classes.includes('footer')) { context = 'footer'; break; }
        if (classes.includes('hero')) { context = 'hero'; break; }
        if (classes.includes('header')) { context = 'header'; break; }
        if (classes.includes('sidebar')) { context = 'sidebar'; break; }
        if (classes.includes('nav')) { context = 'navigation'; break; }
        const heading = parent.querySelector && parent.querySelector('h1, h2, h3, h4, h5, h6');
        if (heading && heading.textContent) {
          context = heading.textContent.trim().toLowerCase().replace(/\s+/g, '-');
          break;
        }
        current = parent;
      }
      // Location-aware adjustment for hero/header/footer (absolute page position)
      if (context === 'hero' || context === 'header' || context === 'footer') {
        const rect = element.getBoundingClientRect();
        const absoluteTop = rect.top + window.pageYOffset;
        const absoluteBottom = rect.bottom + window.pageYOffset;
        const pageHeight = Math.max(document.documentElement.scrollHeight, document.body.scrollHeight);
        // Only call hero/header if near the top (top 25% of page)
        if ((context === 'hero' || context === 'header') && absoluteTop > pageHeight * 0.25) {
          context = null;
        }
        // Only call footer if near the bottom (bottom 25% of page)
        if (context === 'footer' && (absoluteBottom < pageHeight * 0.75)) {
          context = null;
        }
      }
      if (!context) {
        context = 'main-content';
      }
      return context;
    } catch (error) {
      console.warn('[DOM Tagger] Context determination failed for element:', element, error);
      return 'main-content'; // Safe fallback
    }
  }

  /**
   * Determine action - prioritize actual text and clear descriptions
   */
  private determineAction(element: HTMLElement): string {
    try {
      if (element.tagName.toLowerCase() === 'select') {
        const select = element as HTMLSelectElement;
        const selectedOption = select.selectedOptions[0];
        if (selectedOption && selectedOption.textContent) {
          return selectedOption.textContent.trim();
        }
      }
      // Priority 1: aria-label (most semantic)
      const ariaLabel = element.getAttribute('aria-label');
      if (ariaLabel && ariaLabel.trim()) return ariaLabel.trim();
      
      // Priority 2: actual text content
      const text = element.textContent?.trim();
      if (text) return text;
      
      // Priority 3: title attribute
      const title = element.getAttribute('title');
      if (title && title.trim()) return title.trim();
      
      // Priority 4: fallback description
      const type = element.tagName.toLowerCase();
      return `${type}-element`;
    } catch (error) {
      console.warn('[DOM Tagger] Action determination failed for element:', element, error);
      return `${element.tagName.toLowerCase()}-element`; // Fallback
    }
  }

  /**
   * Determine value for numeric elements - returns numeric string or null
   */
  private determineValue(element: HTMLElement): string | null {
    try {
      const tag = element.tagName.toLowerCase();
      const inputType = element.getAttribute('type') || '';

      // Helper function to validate numeric value
      const isValidNumber = (value: string): boolean => {
        const trimmed = value.trim();
        return trimmed !== '' && !isNaN(parseFloat(trimmed));
      };

      // <input type="number"> - return element.value if valid number
      if (tag === 'input' && inputType === 'number') {
        const value = (element as HTMLInputElement).value;
        return isValidNumber(value) ? value.trim() : null;
      }

      // <select> - check if all options are numeric and return selected value
      if (tag === 'select') {
        const select = element as HTMLSelectElement;
        const options = Array.from(select.options);
        
        // Check if all option values are numeric
        const allNumeric = options.every(option => 
          option.value === '' || isValidNumber(option.value)
        );
        
        if (allNumeric && select.value && isValidNumber(select.value)) {
          return select.value.trim();
        }
      }

      // Custom dropdowns using <ul><li> with role="presentation"
      if (tag === 'li') {
        const parent = element.parentElement;
        if (parent && parent.tagName.toLowerCase() === 'ul' && 
            parent.getAttribute('role') === 'presentation') {
          
          // Check if this li is selected and has numeric data-value
          const isSelected = element.getAttribute('aria-selected') === 'true' ||
                            element.classList.contains('selected') ||
                            element.classList.contains('active');
          
          if (isSelected) {
            const dataValue = element.getAttribute('data-value');
            if (dataValue && isValidNumber(dataValue)) {
              return dataValue.trim();
            }
          }
        }
      }

      // <div> or <span> with role="option"
      if ((tag === 'div' || tag === 'span') && 
          element.getAttribute('role') === 'option') {
        
        const isSelected = element.getAttribute('aria-selected') === 'true' ||
                          element.classList.contains('selected') ||
                          element.classList.contains('active');
        
        if (isSelected) {
          const textContent = element.textContent?.trim();
          if (textContent && isValidNumber(textContent)) {
            return textContent;
          }
        }
      }

      return null;
    } catch (error) {
      console.warn('[DOM Tagger] Value determination failed for element:', element, error);
      return null; // Safe fallback - no value
    }
  }

  /**
   * Handle click events and tag clicked elements
   */
  private handleClick = (event: MouseEvent): void => {
    try {
      const target = event.target as HTMLElement;
      
      // Tag the clicked element if it matches our selectors
      if (this.config.selectors!.some(selector => target.matches(selector))) {
        this.tagElement(target);
      }
      
      // Extract analytics data and push to data layer (modeled after Hermes script)
      this.extractAndPushAnalytics(target);
    } catch (error) {
      console.warn('[DOM Tagger] Click handling failed:', error);
      // Don't prevent the original click event from proceeding
    }
  };

  /**
   * Handle change events for select elements and number inputs
   */
  private handleChange = (event: Event): void => {
    try {
      const target = event.target as HTMLElement;
      
      // Handle select elements
      if (target.tagName.toLowerCase() === 'select') {
        this.updateSelectAction(target as HTMLSelectElement);
      }
      
      // Handle number inputs (steppers)
      if (target.tagName.toLowerCase() === 'input' && target.getAttribute('type') === 'number') {
        this.updateNumberInputValue(target as HTMLInputElement);
      }
    } catch (error) {
      console.warn('[DOM Tagger] Change handling failed:', error);
      // Don't prevent the original change event from proceeding
    }
  };

  /**
   * Update the data-value attribute for a number input based on current value
   */
  private updateNumberInputValue(inputElement: HTMLInputElement): void {
    try {
      const value = inputElement.value.trim();
      if (value !== '') {
        inputElement.setAttribute(this.config.attributes!.value!, value);
      }
    } catch (error) {
      console.warn('[DOM Tagger] Failed to update number input value:', inputElement, error);
    }
  }

  /**
   * Update the data-action attribute for a select element based on current selection
   */
  private updateSelectAction(selectElement: HTMLSelectElement): void {
    try {
      const selectedOption = selectElement.selectedOptions[0];
      if (selectedOption && selectedOption.textContent) {
        const newAction = selectedOption.textContent.trim();
        selectElement.setAttribute(this.config.attributes!.action!, newAction);
      }
    } catch (error) {
      console.warn('[DOM Tagger] Failed to update select action:', selectElement, error);
    }
  }

  /**
   * Extract analytics data by traversing up the DOM tree (max 10 levels)
   * Modeled after the Hermes click capture script
   */
  private extractAndPushAnalytics(clickedElement: HTMLElement): void {
    try {
      const startTime = performance.now();
      const maxTraversalDepth = 10;
      let currentDepth = 0;
      let currentNode: Node | null = clickedElement;
      const eventObject: AnalyticsData = {};
      let hasAnalyticsData = false;
      
      // Traverse up the DOM tree looking for data attributes
      while (currentDepth < maxTraversalDepth && currentNode) {
        // Check if current node has analytics attributes
        if (currentNode.nodeType === Node.ELEMENT_NODE) {
          const element = currentNode as HTMLElement;
          
          // Check for data-action and data-context (primary attributes)
          const action = element.getAttribute('data-action');
          const context = element.getAttribute('data-context');
          const type = element.getAttribute('data-type');
          const value = element.getAttribute('data-value');
          
          if (action || context) {
            if (action) eventObject.action = action;
            if (context) eventObject.context = context;
            hasAnalyticsData = true;
          }
          
          // Also check for data-type and data-value (secondary attributes)
          if (type) eventObject.type = type;
          if (value) eventObject.value = value;
        }
        
        // Move to parent node
        currentNode = currentNode.parentNode;
        currentDepth++;
      }
      
      // Push to data layer if we found analytics data
      if (hasAnalyticsData) {
        this.pushToDataLayer(eventObject);
      }
    } catch (error) {
      console.warn('[DOM Tagger] Analytics extraction failed:', error);
      // Continue execution - analytics failure shouldn't break the application
    }
  }

  /**
   * Get total page memory usage in MB using Performance API
   * Note: This represents total JavaScript heap size, not just this tool's overhead
   */
  private getMemoryUsage(): number {
    try {
      if ('memory' in performance && (performance as any).memory) {
        const memoryInfo = (performance as any).memory;
        return Math.round((memoryInfo.usedJSHeapSize / 1024 / 1024) * 100) / 100; // Convert to MB, round to 2 decimal places
      }
      return 0; // Memory API not available (e.g., Firefox)
    } catch (error) {
      console.warn('[DOM Tagger] Memory usage measurement failed:', error);
      return 0;
    }
  }

  /**
   * Get current performance metrics
   */
  public getPerformanceMetrics(): PagePerformanceMetrics | null {
    return this.performanceMetrics;
  }

  /**
   * Push analytics data to the data layer
   */
  private pushToDataLayer(eventObject: AnalyticsData): void {
    try {
      window.dataLayer = window.dataLayer || [];
      
      const dataLayerEvent: DataLayerEvent = {
        event: 'click_event',
        click_object: eventObject,
        timestamp: Date.now()
      };
      
      window.dataLayer.push(dataLayerEvent);
    } catch (error) {
      console.warn('[DOM Tagger] Failed to push to data layer:', error);
      // Continue execution - analytics failure shouldn't break the application
    }
  }

  /**
   * Push performance event to the data layer
   */
  private pushPerformanceEvent(): void {
    try {
      if (!this.performanceMetrics) return;
      
      window.dataLayer = window.dataLayer || [];
      
      const performanceEvent: PerformanceEvent = {
        event: 'tagger_performance',
        performance: this.performanceMetrics,
        timestamp: Date.now()
      };
      
      window.dataLayer.push(performanceEvent);
      
      if (this.config.debug) {
        console.log('[DOM Tagger] Performance event pushed:', performanceEvent);
      }
    } catch (error) {
      console.warn('[DOM Tagger] Failed to push performance event:', error);
    }
  }

  /**
   * Set up click listener for dynamic element tagging
   */
  private setupClickListener(): void {
    try {
      document.addEventListener('click', this.clickHandler, true); // Use capture phase
    } catch (error) {
      console.error('[DOM Tagger] Failed to set up click listener:', error);
    }
  }

  /**
   * Set up change listener for dynamic element tagging
   */
  private setupChangeListener(): void {
    try {
      document.addEventListener('change', this.changeHandler, true);
    } catch (error) {
      console.error('[DOM Tagger] Failed to set up change listener:', error);
    }
  }

  /**
   * Get all tagged elements
   */
  public getTaggedElements(): TaggedElement[] {
    try {
      const elements = document.querySelectorAll(this.config.selectors!.join(','));
      const taggedElements: TaggedElement[] = [];

      elements.forEach(element => {
        if (element instanceof HTMLElement && this.isElementTagged(element)) {
          taggedElements.push(this.getTaggedElement(element));
        }
      });

      return taggedElements;
    } catch (error) {
      console.warn('[DOM Tagger] Failed to get tagged elements:', error);
      return []; // Return empty array as fallback
    }
  }

  /**
   * Get statistics about tagged elements
   */
  public getStats(): { total: number; tagged: number; types: Record<string, number>; actions: Record<string, number>; contexts: Record<string, number> } {
    try {
      const elements = document.querySelectorAll(this.config.selectors!.join(','));
      const taggedElements = this.getTaggedElements();
      
      const types: Record<string, number> = {};
      const actions: Record<string, number> = {};
      const contexts: Record<string, number> = {};

      taggedElements.forEach(({ type, action, context }) => {
        types[type] = (types[type] || 0) + 1;
        actions[action] = (actions[action] || 0) + 1;
        contexts[context] = (contexts[context] || 0) + 1;
      });

      return {
        total: elements.length,
        tagged: taggedElements.length,
        types,
        actions,
        contexts
      };
    } catch (error) {
      console.warn('[DOM Tagger] Failed to get stats:', error);
      return { total: 0, tagged: 0, types: {}, actions: {}, contexts: {} }; // Safe fallback
    }
  }

  /**
   * Remove all data attributes from elements
   */
  public clearTags(): void {
    try {
      const elements = document.querySelectorAll(this.config.selectors!.join(','));
      elements.forEach(element => {
        if (element instanceof HTMLElement) {
          element.removeAttribute(this.config.attributes!.type!);
          element.removeAttribute(this.config.attributes!.action!);
          element.removeAttribute(this.config.attributes!.context!);
          element.removeAttribute(this.config.attributes!.value!);
        }
      });
    } catch (error) {
      console.warn('[DOM Tagger] Failed to clear tags:', error);
    }
  }

  /**
   * Destroy the tagger and clean up event listeners
   */
  public destroy(): void {
    try {
      document.removeEventListener('click', this.clickHandler, true);
      document.removeEventListener('change', this.changeHandler, true);
    } catch (error) {
      console.warn('[DOM Tagger] Failed to destroy tagger cleanly:', error);
    }
  }
}

// Default export for easy usage
export default DOMTagger; 