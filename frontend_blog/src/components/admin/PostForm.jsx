export default function PostForm({
  title,
  setTitle,
  summary,
  setSummary,
  content,
  setContent,
  published,
  setPublished,
  onSubmit,
  isSubmitting,
  error,
  submitLabel,
}) {
  return (
    <form
      className="post-form"
      onSubmit={onSubmit}
    >
      <div className="form-field">
        <label htmlFor="post-title">
          Titre
        </label>

        <input
          id="post-title"
          type="text"
          value={title}
          onChange={(event) =>
            setTitle(event.target.value)
          }
          minLength={3}
          maxLength={200}
          required
        />
      </div>

      <div className="form-field">
        <label htmlFor="post-summary">
          Résumé
        </label>

        <textarea
          id="post-summary"
          value={summary}
          onChange={(event) =>
            setSummary(event.target.value)
          }
          rows={3}
          maxLength={500}
        />

        <span className="form-hint">
          {summary.length}/500 caractères
        </span>
      </div>

      <div className="form-field">
        <label htmlFor="post-content">
          Contenu
        </label>

        <textarea
          id="post-content"
          value={content}
          onChange={(event) =>
            setContent(event.target.value)
          }
          rows={18}
          required
        />

        <span className="form-hint">
          Markdown accepté.
        </span>
      </div>

      <label className="checkbox-field">
        <input
          type="checkbox"
          checked={published}
          onChange={(event) =>
            setPublished(event.target.checked)
          }
        />

        <span>
          Article publié
        </span>
      </label>

      {error && (
        <p className="form-error">
          {error}
        </p>
      )}

      <div className="post-form__actions">
        <button
          type="submit"
          className="primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Enregistrement..."
            : submitLabel}
        </button>
      </div>
    </form>
  );
}