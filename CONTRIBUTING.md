# Contributing

Terima kasih atas minat Anda untuk berkontribusi pada proyek ini!

## Cara Berkontribusi

### Melaporkan Bug

Jika Anda menemukan bug, silakan buat issue dengan informasi berikut:
- Deskripsi bug yang jelas
- Langkah-langkah untuk reproduce
- Expected behavior
- Actual behavior
- Environment details (OS, Node version, dll)
- Error messages atau stack traces

### Mengusulkan Feature

Untuk mengusulkan feature baru:
- Buat issue dengan label "enhancement"
- Jelaskan use case yang ingin diselesaikan
- Berikan contoh penggunaan yang diharapkan
- Diskusikan implementasi yang mungkin

### Pull Requests

1. Fork repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

#### Guidelines untuk PR

- Ikuti code style yang ada
- Tambahkan tests jika applicable
- Update documentation jika diperlukan
- Pastikan semua tests pass
- Berikan deskripsi yang jelas tentang changes

## Code Style

### JavaScript

- Gunakan ES Modules (import/export)
- Gunakan async/await untuk asynchronous code
- Gunakan classes untuk major components
- Gunakan descriptive variable names
- Add comments untuk complex logic
- Handle errors dengan try-catch

### Contoh Code Style

```javascript
import { WebScraper } from './scraper/WebScraper.js';

export class MyFeature {
  constructor(options = {}) {
    this.options = {
      defaultValue: 'default',
      ...options
    };
  }

  async processData(input) {
    try {
      const result = await this.fetchData(input);
      return this.transformData(result);
    } catch (error) {
      throw new Error(`Failed to process data: ${error.message}`);
    }
  }

  transformData(data) {
    return data.map(item => ({
      id: item.id,
      name: item.name
    }));
  }
}
```

### File Organization

```
src/
├── feature-name/
│   ├── MainClass.js
│   ├── HelperClass.js
│   └── UtilityClass.js
├── utils/
│   └── feature-utils.js
└── cli/
    └── feature-cli.js
```

## Testing

### Running Tests

```bash
node test/test-basic.js
```

### Writing Tests

Tambahkan tests di direktori `test/`:

```javascript
async function testFeature() {
  console.log('Testing MyFeature...');
  
  try {
    const feature = new MyFeature();
    const result = await feature.processData(input);
    
    if (result.success) {
      console.log('✓ Test passed');
    } else {
      console.log('✗ Test failed');
    }
  } catch (error) {
    console.error('✗ Error:', error.message);
  }
}
```

## Documentation

### Update Documentation

Jika Anda menambahkan atau mengubah functionality:

1. Update `README.md` dengan overview
2. Update `API.md` dengan API details
3. Update `USAGE.md` dengan usage examples
4. Update `EXAMPLES.md` dengan practical examples
5. Add inline comments untuk complex code

### Documentation Style

- Gunakan Markdown format
- Berikan contoh code yang jelas
- Jelaskan parameters dan return values
- Include error handling examples

## Commit Messages

Gunakan format berikut:

```
type(scope): subject

body

footer
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Contoh

```
feat(scraper): add support for custom headers

Added ability to pass custom HTTP headers when scraping.
This is useful for authentication or bypassing simple bot detection.

Closes #123
```

## Release Process

1. Update version di `package.json`
2. Update `CHANGELOG.md`
3. Create git tag
4. Push changes dan tag
5. Create GitHub release

## Questions?

Jika ada pertanyaan, silakan:
- Buat issue dengan label "question"
- Diskusi di existing issues
- Contact maintainers

## Code of Conduct

- Bersikap profesional dan respectful
- Be welcoming to newcomers
- Focus on constructive feedback
- No harassment or offensive behavior

## License

Dengan berkontribusi, Anda setuju bahwa kontribusi Anda akan dilisensikan di bawah MIT License yang sama dengan proyek ini.
