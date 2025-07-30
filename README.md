# IP TV Platform

A comprehensive IP TV platform built with Next.js 15, React 19, and Tailwind CSS.

## 🚀 Features

- **Modern Tech Stack**: Next.js 15 with App Router, React 19, Tailwind CSS 4
- **Complete File Structure**: Organized project structure with all necessary components
- **Authentication System**: Login, register, forgot password, and 2FA support
- **Dashboard**: User dashboard with orders, profile, support, affiliate, and balance management
- **Admin Panel**: Comprehensive admin interface for system management
- **Payment Integration**: Support for multiple payment gateways (Stripe, PayPal, Crypto)
- **Responsive Design**: Mobile-first responsive design with Tailwind CSS
- **Dark Mode Support**: Built-in dark mode with CSS variables
- **Custom Components**: Reusable UI components with consistent styling

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Authentication routes
│   ├── (dashboard)/       # Dashboard routes
│   ├── (admin)/           # Admin panel routes
│   ├── api/               # API routes
│   ├── products/          # Product pages
│   ├── support/           # Support pages
│   └── legal/             # Legal pages
├── components/            # Reusable components
│   ├── ui/               # Basic UI components
│   ├── auth/             # Authentication components
│   ├── layout/           # Layout components
│   ├── forms/            # Form components
│   ├── tables/           # Table components
│   ├── charts/           # Chart components
│   ├── payment/          # Payment components
│   └── common/           # Common utility components
├── lib/                  # Utility libraries
├── models/               # Data models
├── middleware/           # Custom middleware
├── hooks/                # Custom React hooks
├── store/                # State management
└── constants/            # Application constants
```

## 🎨 Tailwind CSS Configuration

### Custom Colors

The project includes a comprehensive color system:

- **Primary Colors**: Blue-based primary brand colors
- **Secondary Colors**: Green-based secondary colors
- **Accent Colors**: Purple-based accent colors
- **Semantic Colors**: Success, warning, error, and info colors
- **Neutral Colors**: Gray scale for text and backgrounds

### Custom Fonts

- **Inter**: Primary sans-serif font for body text
- **Poppins**: Display font for headings
- **JetBrains Mono**: Monospace font for code
- **Playfair Display**: Serif font for special content

### Custom Components

Pre-built component classes:

```css
/* Buttons */
.btn-primary, .btn-secondary, .btn-outline, .btn-ghost

/* Inputs */
.input, .input-error

/* Cards */
.card, .card-header, .card-body, .card-footer

/* Badges */
.badge-primary, .badge-secondary, .badge-success, .badge-warning, .badge-error

/* Alerts */
.alert-info, .alert-success, .alert-warning, .alert-error

/* Loading */
.spinner

/* Effects */
.glass, .gradient-text
```

### Custom Animations

- `animate-fade-in`: Fade in animation
- `animate-slide-up`: Slide up animation
- `animate-scale-in`: Scale in animation
- `animate-bounce-soft`: Soft bounce animation
- `animate-pulse-soft`: Soft pulse animation

### Custom Shadows

- `shadow-soft`: Soft shadow for cards
- `shadow-medium`: Medium shadow for elevated elements
- `shadow-large`: Large shadow for modals
- `shadow-glow`: Glow effect for interactive elements

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ip_tv
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Install Tailwind CSS plugins**
   ```bash
   npm install @tailwindcss/forms @tailwindcss/typography @tailwindcss/aspect-ratio @tailwindcss/line-clamp
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🎯 Usage Examples

### Using Custom Colors

```jsx
<div className="bg-primary-500 text-white p-4">
  Primary colored element
</div>

<div className="bg-secondary-100 text-secondary-800 p-4">
  Secondary colored element
</div>
```

### Using Custom Fonts

```jsx
<h1 className="font-display text-4xl font-bold">
  Display heading with Poppins font
</h1>

<p className="font-sans text-base">
  Body text with Inter font
</p>

<code className="font-mono text-sm">
  Code with JetBrains Mono font
</code>
```

### Using Custom Components

```jsx
{/* Button */}
<button className="btn-primary">
  Primary Button
</button>

{/* Input */}
<input type="text" className="input" placeholder="Enter text..." />

{/* Card */}
<div className="card">
  <div className="card-header">
    <h3>Card Title</h3>
  </div>
  <div className="card-body">
    <p>Card content goes here</p>
  </div>
</div>

{/* Badge */}
<span className="badge-success">Success</span>

{/* Alert */}
<div className="alert-info">
  This is an info alert
</div>
```

### Using Custom Animations

```jsx
<div className="animate-fade-in">
  This element will fade in
</div>

<div className="animate-slide-up">
  This element will slide up
</div>
```

### Using Glass Effect

```jsx
<div className="glass p-6 rounded-lg">
  Glass effect element
</div>
```

### Using Gradient Text

```jsx
<h1 className="gradient-text text-4xl font-bold">
  Gradient text heading
</h1>
```

## 🌙 Dark Mode

The project supports dark mode with the `dark` class:

```jsx
// Toggle dark mode
document.documentElement.classList.toggle('dark')

// Or use a button
<button onClick={() => document.documentElement.classList.toggle('dark')}>
  Toggle Dark Mode
</button>
```

## 📱 Responsive Design

The project includes custom breakpoints:

- `xs`: 475px
- `sm`: 640px (default)
- `md`: 768px (default)
- `lg`: 1024px (default)
- `xl`: 1280px (default)
- `2xl`: 1536px (default)
- `3xl`: 1600px (custom)
- `4xl`: 1920px (custom)

## 🔧 Customization

### Adding New Colors

Edit `tailwind.config.js`:

```javascript
colors: {
  custom: {
    50: '#fef7ff',
    100: '#fdeeff',
    // ... add more shades
    900: '#581c87',
  }
}
```

### Adding New Fonts

1. Import the font in `globals.css`
2. Add to `tailwind.config.js`:

```javascript
fontFamily: {
  custom: ['Custom Font', 'fallback-font', 'sans-serif'],
}
```

### Adding New Components

Add to the `@layer components` section in `globals.css`:

```css
.custom-component {
  @apply base-styles utility-classes;
}
```

## 📦 Available Scripts

- `npm run dev`: Start development server
- `npm run build`: Build for production
- `npm run start`: Start production server
- `npm run lint`: Run ESLint

## 🎨 Design System

The project follows a consistent design system with:

- **Spacing Scale**: 4px base unit (0.25rem)
- **Border Radius**: Consistent rounded corners
- **Typography Scale**: Harmonious font sizes
- **Color Palette**: Semantic color system
- **Component Library**: Reusable UI components

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:

- Create an issue in the repository
- Check the documentation
- Review the component examples

---

Built with ❤️ using Next.js, React, and Tailwind CSS
