'use client'

import { useMemo, useState } from 'react'
import { createClient } from '@/infrastructure/supabase/client'
import styles from './MikanVarietyManager.module.css'

type Variety = {
  id: string
  name: string
  reading: string | null
  aliases: string[] | null
  alias_readings: string[] | null
  color: string
  shape: string
  description: string | null
  parent1_id: string | null
  parent2_id: string | null
  is_visible: boolean
  variety_type: string | null
}

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
    setMessage('保存しました')
  }

  return <div className={styles.layout}>
    <section className={styles.list}>
      <div className={styles.listHeader}><input value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="品種を検索" /><button onClick={newVariety}>＋ 追加</button></div>
      <div className={styles.items}>{filtered.map(v => <button key={v.id} className={selectedId === v.id ? styles.selected : ''} onClick={() => select(v)}><strong>{v.name}</strong><span>{v.reading || '読み未登録'}</span></button>)}</div>
    </section>
    <section className={styles.editor}>
      <h2>{selectedId ? '品種を編集' : '品種を追加'}</h2>
      <label>品種名<input value={form.name} onChange={e => setForm({...form,name:e.target.value})} /></label>
      <label>読み<input value={form.reading} onChange={e => setForm({...form,reading:e.target.value})} /></label>
      <label>別名（カンマ区切り）<input value={form.aliases} onChange={e => setForm({...form,aliases:e.target.value})} /></label>
      <label>別名の読み（カンマ区切り）<input value={form.alias_readings} onChange={e => setForm({...form,alias_readings:e.target.value})} /></label>
      <div className={styles.row}><label>色<input type="color" value={form.color} onChange={e => setForm({...form,color:e.target.value})} /></label><label>形<select value={form.shape} onChange={e => setForm({...form,shape:e.target.value})}>{['normal','round','flat','egg','deko','unknown'].map(x=><option key={x}>{x}</option>)}</select></label></div>
      <label>種別<select value={form.variety_type} onChange={e => setForm({...form,variety_type:e.target.value})}><option value="cultivar">cultivar</option><option value="intermediate">intermediate</option><option value="unknown">unknown</option></select></label>
      <label>親1<select value={form.parent1_id} onChange={e => setForm({...form,parent1_id:e.target.value})}><option value="">なし</option>{varieties.filter(v=>v.id!==selectedId).map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></label>
      <label>親2<select value={form.parent2_id} onChange={e => setForm({...form,parent2_id:e.target.value})}><option value="">なし</option>{varieties.filter(v=>v.id!==selectedId).map(v=><option key={v.id} value={v.id}>{v.name}</option>)}</select></label>
      <label>説明<textarea rows={4} value={form.description} onChange={e => setForm({...form,description:e.target.value})} /></label>
      <label className={styles.check}><input type="checkbox" checked={form.is_visible} onChange={e => setForm({...form,is_visible:e.target.checked})} />通常の一覧に表示する</label>
      <button className={styles.save} disabled={saving} onClick={save}>{saving ? '保存中…' : '保存'}</button>
      {message && <p className={styles.message}>{message}</p>}
    </section>
  </div>
}
