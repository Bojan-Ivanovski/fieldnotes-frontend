import './SearchForm.css'
import { Button, SearchField } from 'fieldnotes-ui'
import { useNavigate } from 'react-router'
import type { FormEvent } from 'react'
import type { SearchType } from '../../data/types.ts'
import { MAX_QUERY_LENGTH, searchUrl } from '../../lib/search-state.ts'

export function SearchForm({
  query = '',
  type = 'all',
}: {
  query?: string
  type?: SearchType
}) {
  const navigate = useNavigate()

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    navigate(searchUrl(String(form.get('q') ?? ''), type))
  }

  return (
    <form className="discovery-search-form" role="search" onSubmit={submit}>
      <SearchField
        key={query}
        label="Search Books and Folios"
        name="q"
        defaultValue={query}
        placeholder="Search Books and Folios…"
        maxLength={MAX_QUERY_LENGTH}
        autoComplete="off"
        enterKeyHint="search"
      />
      <Button type="submit" size="lg">
        Search <span aria-hidden="true">↗</span>
      </Button>
    </form>
  )
}
