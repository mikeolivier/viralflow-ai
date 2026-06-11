import Link from 'next/link';
import { ArrowRight, Brain, Zap, Sparkles, Lightbulb } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Navigation */}
      <nav className="border-b border-slate-700 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">ViralFlow AI</h1>
          <div className="flex gap-4">
            <Link
              href="/login"
              className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-medium"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <div className="inline-block mb-6">
            <span className="px-4 py-2 bg-cyan-500/10 border border-cyan-500/30 rounded-full text-cyan-300 text-sm font-medium">
              ✨ Your AI Producer
            </span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
            Eliminate Video
            <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
              {' '}Editing
            </span>
          </h1>

          <p className="text-xl text-slate-400 mb-8 max-w-2xl mx-auto leading-relaxed">
            Upload raw footage. ViralFlow AI analyzes every moment and automatically applies proven editing patterns used in high-performing content. No skills needed. No hours wasted.
          </p>

          <div className="flex gap-4 justify-center mb-12">
            <Link
              href="/signup"
              className="px-8 py-4 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition-colors font-semibold flex items-center gap-2"
            >
              Start Creating <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="#features"
              className="px-8 py-4 border-2 border-cyan-500 text-cyan-400 rounded-lg hover:bg-cyan-500/10 transition-colors font-semibold"
            >
              See How It Works
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div>
              <p className="text-3xl font-bold text-cyan-400">10K+</p>
              <p className="text-slate-400 text-sm">Videos Edited</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyan-400">92%</p>
              <p className="text-slate-400 text-sm">Creator Satisfaction</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-cyan-400">5 mins</p>
              <p className="text-slate-400 text-sm">Average Edit Time</p>
            </div>
          </div>
        </div>
      </section>

      {/* Context-Aware Editing Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white mb-4 text-center">Context-Aware Editing</h2>
        <p className="text-xl text-slate-400 mb-12 text-center max-w-2xl mx-auto">
          The AI doesn't just apply effects. It understands what's happening in your video and applies the right editing patterns automatically.
        </p>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              moment: 'Funny Fall Detected',
              effects: ['Freeze frame', 'Zoom in', 'Meme sound', 'Big head effect'],
              description: 'AI detects the comedic moment and amplifies it with proven funny-moment editing patterns.',
            },
            {
              moment: 'Reaction Moment Detected',
              effects: ['Zoom', 'Sound effect', 'Slow motion', 'Eye zoom'],
              description: 'AI recognizes emotional reactions and applies techniques that maximize viewer engagement.',
            },
            {
              moment: 'Transition Opportunity',
              effects: ['Seamless morph', 'Object wipe', 'Flash transition', 'Music sync'],
              description: 'AI finds natural cut points and applies smooth transitions that keep viewers watching.',
            },
            {
              moment: 'Pet Moment Detected',
              effects: ['Cute zoom', 'Slow motion', 'Heart particles', 'Cute sound'],
              description: 'AI recognizes adorable moments and applies effects that drive shares and engagement.',
            },
          ].map((item, index) => (
            <div
              key={index}
              className="p-8 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500 transition-colors"
            >
              <div className="flex items-center gap-3 mb-4">
                <Brain className="w-6 h-6 text-cyan-400" />
                <h3 className="text-xl font-semibold text-white">{item.moment}</h3>
              </div>
              <p className="text-slate-400 mb-4">{item.description}</p>
              <div className="flex flex-wrap gap-2">
                {item.effects.map((effect, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/40 rounded-full text-cyan-300 text-xs font-medium"
                  >
                    {effect}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Why ViralFlow AI Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">Why Creators Choose ViralFlow AI</h2>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              icon: Zap,
              title: 'No Editing Skills Required',
              description: 'You don\'t need to know how to edit. Upload your footage and let the AI handle the creative decisions.',
            },
            {
              icon: Brain,
              title: 'Intelligent Pattern Recognition',
              description: 'AI analyzes your footage and applies proven editing patterns from high-performing content creators.',
            },
            {
              icon: Sparkles,
              title: 'Save Hours Every Week',
              description: 'What used to take 3+ hours now takes 5 minutes. Spend more time creating, less time editing.',
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="p-8 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500 transition-colors"
              >
                <Icon className="w-12 h-12 text-cyan-400 mb-4" />
                <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
                <p className="text-slate-400">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* How It Works */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">The Process</h2>

        <div className="grid md:grid-cols-4 gap-8">
          {[
            { step: 1, title: 'Upload', description: 'Drop your raw video file (10s - 1 min)' },
            { step: 2, title: 'Analyze', description: 'AI detects moments and scenes' },
            { step: 3, title: 'Edit', description: 'Applies proven editing patterns' },
            { step: 4, title: 'Download', description: 'Get your edited video instantly' },
          ].map((item) => (
            <div key={item.step} className="text-center">
              <div className="w-16 h-16 bg-cyan-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-white">{item.step}</span>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-slate-400 text-sm">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-white mb-12 text-center">What Creators Say</h2>

        <div className="grid md:grid-cols-2 gap-8">
          {[
            {
              quote: 'I used to spend 3 hours editing every video. Now I spend 3 minutes uploading. This is a game-changer.',
              author: 'Sarah Chen',
              role: 'TikTok Creator, 50K followers',
            },
            {
              quote: 'The AI understands what makes content engaging. It\'s like having a professional editor built in.',
              author: 'Marcus Johnson',
              role: 'Content Agency Owner',
            },
            {
              quote: 'Finally, a tool that actually saves me time instead of adding complexity.',
              author: 'Emma Rodriguez',
              role: 'YouTuber, 100K followers',
            },
            {
              quote: 'The editing patterns are sophisticated but feel natural. Not over-processed.',
              author: 'Alex Kim',
              role: 'Digital Marketer',
            },
          ].map((testimonial, index) => (
            <div
              key={index}
              className="p-8 bg-slate-800/50 border border-slate-700 rounded-lg"
            >
              <p className="text-slate-300 mb-4 italic">"{testimonial.quote}"</p>
              <div>
                <p className="text-white font-semibold">{testimonial.author}</p>
                <p className="text-slate-400 text-sm">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-lg p-12 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Stop Wasting Hours on Editing</h2>
          <p className="text-cyan-100 mb-8 text-lg">
            Join thousands of creators who've eliminated video editing from their workflow.
          </p>
          <Link
            href="/signup"
            className="inline-block px-8 py-4 bg-white text-cyan-600 rounded-lg hover:bg-slate-100 transition-colors font-semibold"
          >
            Start Free Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700 bg-slate-900/50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-slate-400 text-sm">
          <p>&copy; 2026 ViralFlow AI. Your AI Producer. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
