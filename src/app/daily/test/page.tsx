import React from 'react';
import Link from 'next/link';

export default function DigestTestPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Navigation */}
        <div className="mb-8 flex items-center gap-2">
          <Link href="/daily" className="text-blue-400 hover:text-blue-300 transition">
            ← Back to Daily
          </Link>
        </div>

        {/* Header */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            AI Builders Digest
          </h1>
          <p className="text-slate-400">
            Generated: <span className="text-slate-300">2026-04-10 18:19:04 UTC+8</span>
          </p>
          <div className="mt-4 h-px bg-gradient-to-r from-blue-500 to-transparent" />
        </div>

        {/* BLOGS SECTION */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">📰</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              Blogs
            </span>
          </h2>

          <div className="space-y-8">
            {/* Blog Item 1 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500/50 transition">
              <h3 className="text-xl font-bold text-blue-300 mb-4">
                Building Production AI Systems: Lessons from Scale
              </h3>

              <div className="space-y-4 text-slate-300">
                <div>
                  <p className="font-semibold text-slate-200 mb-2">Bottom line:</p>
                  <p>Deployment of AI systems requires careful consideration of infrastructure, monitoring, and cost optimization.</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-200 mb-2">Key points:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Teams need to invest in observability early to catch problems before they impact users.</li>
                    <li>• Comprehensive logging, monitoring model drift, and establishing clear alerting thresholds are crucial.</li>
                  </ul>
                </div>

                <div className="border-t border-slate-700 pt-4 mt-4">
                  <p className="font-semibold text-slate-200 mb-2">要点：</p>
                  <p className="text-slate-400">部署AI系统需要小心考虑基础设施、监控和成本优化。</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-200 mb-2">关键点：</p>
                  <ul className="space-y-1 ml-4 text-slate-400">
                    <li>• 团队需要在早期就投入可观性，以便在影响用户之前就捕捉到问题。</li>
                    <li>• 全面的日志、监控模型漂移以及建立明确的报警阈值对于维护系统健康至关重要。</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <a
                  href="https://example.com/production-ai"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition text-sm"
                >
                  https://example.com/production-ai ↗
                </a>
              </div>
            </div>

            {/* Blog Item 2 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-blue-500/50 transition">
              <h3 className="text-xl font-bold text-blue-300 mb-4">
                Fine-tuning vs Prompt Engineering: When to Use Each
              </h3>

              <div className="space-y-4 text-slate-300">
                <div>
                  <p className="font-semibold text-slate-200 mb-2">Bottom line:</p>
                  <p>For customer service applications, prompt engineering achieves better results than fine-tuning with lower infrastructure costs.</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-200 mb-2">Key points:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Fine-tuning provides higher accuracy improvements for domain-specific tasks compared to prompting alone.</li>
                    <li>• Training costs increase with fine-tuning but produce reusable models.</li>
                  </ul>
                </div>

                <div className="border-t border-slate-700 pt-4 mt-4">
                  <p className="font-semibold text-slate-200 mb-2">要点：</p>
                  <p className="text-slate-400">客户服务应用中，基于上下文的快速工程比精细调优取得更好效果。</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-200 mb-2">关键点：</p>
                  <ul className="space-y-1 ml-4 text-slate-400">
                    <li>• 对于特定领域的任务，微调提供更高的准确度提升。</li>
                    <li>• 调参训练成本增加，但产生可复用模型。</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <a
                  href="https://example.com/fine-tuning-vs-prompting"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition text-sm"
                >
                  https://example.com/fine-tuning-vs-prompting ↗
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* PODCASTS SECTION */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">🎙️</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-400">
              Podcasts
            </span>
          </h2>

          <div className="space-y-8">
            {/* Podcast Item 1 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-orange-500/50 transition">
              <h3 className="text-xl font-bold text-orange-300 mb-4">
                AI Builders Weekly — "Scaling LLM Inference: From Prototypes to Production"
              </h3>

              <div className="space-y-4 text-slate-300">
                <div>
                  <p className="font-semibold text-slate-200 mb-2">Bottom line:</p>
                  <p>Building custom serving layers required advanced infrastructure development beyond model training.</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-200 mb-2">Key insights:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Smaller models with clever routing resulted in reduced latency while maintaining accuracy.</li>
                    <li>• Investing in model compression techniques like quantization is crucial for production deployment.</li>
                  </ul>
                </div>

                <div className="border-t border-slate-700 pt-4 mt-4">
                  <p className="font-semibold text-slate-200 mb-2">要点：</p>
                  <p className="text-slate-400">构建定制的服务层需要高级基础设施开发，超越模型训练的范围。</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-200 mb-2">核心洞察：</p>
                  <ul className="space-y-1 ml-4 text-slate-400">
                    <li>• 更小的模型搭配聪明的路由结果是降低延迟并保持准确性。</li>
                    <li>• 对模型压缩技术的投资对生产部署至关重要。</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <a
                  href="https://example.com/podcast-llm-scaling"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition text-sm"
                >
                  https://example.com/podcast-llm-scaling ↗
                </a>
              </div>
            </div>

            {/* Podcast Item 2 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-orange-500/50 transition">
              <h3 className="text-xl font-bold text-orange-300 mb-4">
                Tech Ethics Today — "Open Source Model Safety: Who's Responsible?"
              </h3>

              <div className="space-y-4 text-slate-300">
                <div>
                  <p className="font-semibold text-slate-200 mb-2">Bottom line:</p>
                  <p>Clear documentation and testing results improve user understanding of model risks and limitations.</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-200 mb-2">Key insights:</p>
                  <ul className="space-y-1 ml-4">
                    <li>• Researchers recognize the potential for harmful code in AI models requires careful evaluation.</li>
                    <li>• Legal experts discuss evolving liability standards, including proposals for mandatory safety audits.</li>
                  </ul>
                </div>

                <div className="border-t border-slate-700 pt-4 mt-4">
                  <p className="font-semibold text-slate-200 mb-2">要点：</p>
                  <p className="text-slate-400">清晰的文档和测试结果提升了用户对模型风险和局限性的理解。</p>
                </div>

                <div>
                  <p className="font-semibold text-slate-200 mb-2">核心洞察：</p>
                  <ul className="space-y-1 ml-4 text-slate-400">
                    <li>• 研究人员认识到AI模型中有害代码的潜力需要仔细评估。</li>
                    <li>• 法律专家讨论不断演变的责任标准，包括强制性安全审计提案。</li>
                  </ul>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-700">
                <a
                  href="https://example.com/podcast-safety"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 transition text-sm"
                >
                  https://example.com/podcast-safety ↗
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* TWEETS SECTION */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <span className="text-2xl">𝕏</span>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-300 to-slate-400">
              Tweets
            </span>
          </h2>

          <div className="space-y-6">
            {/* Tweet Author 1 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition">
              <h3 className="text-lg font-bold mb-4">
                <a
                  href="https://x.com/yannlecun"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-cyan-200 transition"
                >
                  @yannlecun — Yann LeCun
                </a>
              </h3>

              <div className="text-slate-300 leading-relaxed">
                <p>
                  今天的内容强调了开发AI的效率、逻辑以及一致性的重要性，特别是在关注从较少的例子中学习和快速任务适应方面。讨论承认了这些方面的潜力可以取得重大进展。
                </p>
              </div>
            </div>

            {/* Tweet Author 2 */}
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 hover:border-cyan-500/50 transition">
              <h3 className="text-lg font-bold mb-4">
                <a
                  href="https://x.com/andrewng"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-cyan-300 hover:text-cyan-200 transition"
                >
                  @andrewng — Andrew Ng
                </a>
              </h3>

              <div className="text-slate-300 leading-relaxed">
                <p>
                  今天的内容讨论了生成价值而不是模型准确性对于成功的AI实施的重要性。它强调在构建模型之前投资于数据基础设施，以避免训练出糟糕的数据后失望。
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-slate-700 text-center text-slate-500 text-sm">
          <p>This is a test page showcasing the digest layout and styling.</p>
        </div>
      </div>
    </div>
  );
}
