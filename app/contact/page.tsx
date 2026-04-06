export default function ContactPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-16">
      <div className="max-w-3xl space-y-4">
        <p className="text-sm uppercase tracking-[0.22em] text-neutral-500">Contact</p>
        <h1 className="font-display text-4xl font-semibold text-black">Reach the Rivayat team.</h1>
        <p className="text-base leading-8 text-neutral-700">
          Questions, support, or partnership inquiries can be sent to{" "}
          <a href="mailto:hello@rivayat.app" className="font-medium text-black underline-offset-4 hover:underline">
            hello@rivayat.app
          </a>
          .
        </p>
      </div>
    </div>
  );
}
