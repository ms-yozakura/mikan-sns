'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/infrastructure/supabase/client'
import styles from './MikanVarietyManager.module.css'
import { getResultLabel } from '@/features/mikan/components/MikanPicker'
import { MikanIcon } from '@/features/mikan/components/MikanIcon'
import { Icon } from '@iconify/react'
import { normalize } from 'path'
import { Variety } from '@/features/mikan/types/Variety'

const empty = {
  name: '',
  reading: '',
  aliases: '',
  alias_readings: '',
  color: '#ff9800',
  shape: 'normal',
  description: '',
  parent1_id: '',
  parent2_id: '',
  is_visible: true,
  variety_type: 'cultivar',
}

export function MikanVarietyManager({ initialVarieties }: { initialVarieties: Variety[] }) {
  const supabase = useMemo(() => createClient(), [])
  const [varieties, setVarieties] = useState(initialVarieties)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [keyword, setKeyword] = useState('')
  const [form, setForm] = useState(empty)
  const [message, setMessage] = useState('')
  const [saving, setSaving] = useState(false)

  const filtered = varieties.filter(v =>
    [v.name, v.reading, ...(v.aliases ?? [])].some(x => x?.toLowerCase().includes(keyword.toLowerCase()))
  )

  function select(v: Variety) {
    setSelectedId(v.id)
    setForm({
      name: v.name,
      reading: v.reading ?? '',
      aliases: (v.aliases ?? []).join(', '),
      alias_readings: (v.alias_readings ?? []).join(', '),
      color: v.color,
      shape: v.shape,
      description: v.description ?? '',
      parent1_id: v.parent1_id ?? '',
      parent2_id: v.parent2_id ?? '',
      is_visible: v.is_visible,
      variety_type: v.variety_type ?? 'cultivar',
    })
    setMessage('')
  }

  function newVariety() {
    setSelectedId(null)
    setForm(empty)
    setMessage('')
  }

  async function save() {
    if (!form.name.trim()) return setMessage('品種名を入力してください')
    setSaving(true)
    setMessage('')
    const split = (value: string) => value.split(',').map(x => x.trim()).filter(Boolean)
    const payload = {
      name: form.name.trim(),
      reading: form.reading.trim() || null,
      aliases: split(form.aliases),
      alias_readings: split(form.alias_readings),
      color: form.color,
      shape: form.shape,
      description: form.description.trim() || null,
      parent1_id: form.parent1_id || null,
      parent2_id: form.parent2_id || null,
      is_visible: form.is_visible,
      variety_type: form.variety_type,
    }

    const query = selectedId
      ? supabase.from('mikan_varieties').update(payload).eq('id', selectedId).select().single()
      : supabase.from('mikan_varieties').insert(payload).select().single()
    const { data, error } = await query

    setSaving(false)
    if (error) return setMessage(error.message)
    if (selectedId) setVarieties(vs => vs.map(v => v.id === selectedId ? data as Variety : v))
    else {
      setVarieties(vs => [...vs, data as Variety].sort((a, b) => a.name.localeCompare(b.name, 'ja')))
      setSelectedId(data.id)
    }
    setForm(current => ({ ...current, is_visible: data.is_visible }))
    setMessage('保存しました')
  }

  async function setVisibility(isVisible: boolean) {
    if (!selectedId) return

    const target = varieties.find(v => v.id === selectedId)
    if (!target) return

    if (!isVisible && !window.confirm(`「${target.name}」を非表示にしますか？\n新規投稿や通常の検索候補からは除外されますが、過去の投稿では引き続き表示されます。`)) {
      return
    }

    setSaving(true)
    setMessage('')

    const { data, error } = await supabase
      .from('mikan_varieties')
      .update({ is_visible: isVisible })
      .eq('id', selectedId)
      .select()
      .single()

    setSaving(false)
    if (error) return setMessage(error.message)

    setVarieties(vs => vs.map(v => v.id === selectedId ? data as Variety : v))
    setForm(current => ({ ...current, is_visible: isVisible }))
    setMessage(isVisible ? '再表示しました' : '非表示にしました')
  }

  const normalizedKeyword = normalize(keyword)

  return <div className={styles.layout}>
    <section className={styles.list}>
      <div className={styles.listHeader}>
        <input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="品種を検索" />
        <button onClick={newVariety}>＋ 追加</button>
      </div>
      <div className={styles.items}>
        {filtered.map((v: Variety) =>
          <button key={v.id}
            className={selectedId === v.id ? styles.selected : ''}
            onClick={() => select(v)}
          >
            <div className={styles.mikanIcon}>
              <MikanIcon color={v.color} shape={v.shape} size={42} />
            </div>
            <div>
              <span className={styles.name}>
                {getResultLabel(v, normalizedKeyword)}
                {!v.is_visible && <span className={styles.hiddenBadge}>非表示</span>}
              </span>
              <span className={styles.aliases}>{v.aliases != null && v.aliases.length != 0 ? "(" + v.aliases + ")" : ""}</span>
              {selectedId === v.id
                ? <div>
                  <div className={styles.detailSection}>
                    <p className={styles.parentLine}>
                      <Icon icon="mdi:source-branch" aria-hidden="true" />
                      <span>{(varieties.find(vv => vv.id == v.parent1_id))?.name ?? "無し"}</span>×
                      <span>{(varieties.find(vv => vv.id == v.parent2_id))?.name ?? "無し"}</span>
                    </p>
                  </div>
                  <div className={styles.detailSection}>
                    <p className={styles.description}>{v.description ?? '説明はまだありません。'}</p>
                  </div>
                </div>
                : null}
            </div>
          </button>
        )}
      </div>
    </section>
    <section className={styles.editor}>
      <h2>{selectedId ? '品種を編集' : '品種を追加'}</h2>
      <label>品種名<input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
      <label>読み<input value={form.reading} onChange={e => setForm({ ...form, reading: e.target.value })} /></label>
      <label>別名（カンマ区切り）<input value={form.aliases} onChange={e => setForm({ ...form, aliases: e.target.value })} /></label>
      <label>別名の読み（カンマ区切り）<input value={form.alias_readings} onChange={e => setForm({ ...form, alias_readings: e.target.value })} /></label>
      <div className={styles.row}><label>色<input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} /></label><label>形<select value={form.shape} onChange={e => setForm({ ...form, shape: e.target.value })}>{['normal', 'round', 'flat', 'egg', 'deko', 'unknown'].map(x => <option key={x}>{x}</option>)}</select></label></div>
      <label>種別<select value={form.variety_type} onChange={e => setForm({ ...form, variety_type: e.target.value })}><option value="cultivar">cultivar</option><option value="intermediate">intermediate</option><option value="unknown">unknown</option></select></label>
      <label>親1<select value={form.parent1_id} onChange={e => setForm({ ...form, parent1_id: e.target.value })}><option value="">なし</option>{varieties.filter(v => v.id !== selectedId).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></label>
      <label>親2<select value={form.parent2_id} onChange={e => setForm({ ...form, parent2_id: e.target.value })}><option value="">なし</option>{varieties.filter(v => v.id !== selectedId).map(v => <option key={v.id} value={v.id}>{v.name}</option>)}</select></label>
      <label>説明<textarea rows={4} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></label>
      <button className={styles.save} disabled={saving} onClick={save}>{saving ? '保存中…' : '保存'}</button>
      {selectedId && (
        <button
          className={form.is_visible ? styles.hide : styles.restore}
          disabled={saving}
          onClick={() => setVisibility(!form.is_visible)}
        >
          {form.is_visible ? '品種を非表示にする' : '品種を再表示する'}
        </button>
      )}
      {message && <p className={styles.message}>{message}</p>}
    </section>
  </div>
}
