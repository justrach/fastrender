use wasm_bindgen::prelude::*;
use std::collections::HashMap;
use pulldown_cmark::{html::push_html, Options, Parser, Event, Tag, CodeBlockKind};

// Cache size for rendered content
const CACHE_SIZE: usize = 100;

#[wasm_bindgen(start)]
pub fn init() {
    console_error_panic_hook::set_once();
}

#[wasm_bindgen]
pub struct FastRenderCore {
    cache: HashMap<String, String>,
    debug: bool,
}

#[wasm_bindgen]
impl FastRenderCore {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        FastRenderCore {
            cache: HashMap::with_capacity(CACHE_SIZE),
            debug: false,
        }
    }

    #[wasm_bindgen]
    pub fn render_markdown(&mut self, input: &str) -> Result<String, JsValue> {
        // Check cache first
        if let Some(cached) = self.cache.get(input) {
            return Ok(cached.clone());
        }

        // Parse and render markdown
        let mut options = Options::empty();
        options.insert(Options::ENABLE_TABLES);
        options.insert(Options::ENABLE_FOOTNOTES);
        options.insert(Options::ENABLE_STRIKETHROUGH);
        options.insert(Options::ENABLE_TASKLISTS);

        let parser = Parser::new_ext(input, options);
        let mut events: Vec<Event> = parser.collect();
        
        // Process code blocks and preserve math blocks
        for event in &mut events {
            match event {
                Event::Start(Tag::CodeBlock(CodeBlockKind::Fenced(lang))) => {
                    // Add language class for syntax highlighting
                    *event = Event::Html(format!("<pre><code class=\"language-{}\">\n", lang).into());
                },
                // Preserve math blocks by wrapping them in special markers
                Event::Text(text) => {
                    if text.contains("$$") || text.contains('$') {
                        *event = Event::Text(text.to_string().into());
                    }
                },
                _ => {}
            }
        }

        let mut html_output = String::new();
        push_html(&mut html_output, events.into_iter());

        // Cache the result
        if self.cache.len() >= CACHE_SIZE {
            self.cache.clear();
        }
        self.cache.insert(input.to_string(), html_output.clone());

        Ok(html_output)
    }

    #[wasm_bindgen]
    pub fn clear_cache(&mut self) {
        self.cache.clear();
    }

    #[wasm_bindgen]
    pub fn set_debug(&mut self, debug: bool) {
        self.debug = debug;
    }
} 