import { useEffect, useMemo, useState } from 'react';
import { tasksApi } from './api.js';

const blankTask = () => ({ title: '', description: '', date: '', time: '', completed: false });

function toForm(task) {
  const date = new Date(task.scheduledAt);
  const offset = date.getTimezoneOffset() * 60000;
  const local = new Date(date.getTime() - offset).toISOString();
  return { ...task, date: local.slice(0, 10), time: local.slice(11, 16) };
}

function taskPayload(form) {
  return {
    title: form.title.trim(),
    description: form.description.trim(),
    completed: form.completed,
    scheduledAt: new Date(`${form.date}T${form.time}`).toISOString()
  };
}

function formatDate(dateValue) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' }).format(new Date(dateValue));
}

function formatTime(dateValue) {
  return new Intl.DateTimeFormat('pt-BR', { hour: '2-digit', minute: '2-digit' }).format(new Date(dateValue));
}

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState('all');
  const [form, setForm] = useState(blankTask);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFormOpen, setFormOpen] = useState(false);
  const [deleteCandidate, setDeleteCandidate] = useState(null);

  async function loadTasks() {
    try {
      setLoading(true);
      setTasks(await tasksApi.list());
    } catch (err) { setError('Não foi possível carregar suas tarefas. Verifique a API.'); }
    finally { setLoading(false); }
  }

  useEffect(() => { loadTasks(); }, []);

  const visibleTasks = useMemo(() => tasks.filter((task) => filter === 'all' || (filter === 'completed' ? task.completed : !task.completed)), [tasks, filter]);
  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;
  const progress = tasks.length ? Math.round((completed / tasks.length) * 100) : 0;

  function updateForm(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function closeForm() {
    setFormOpen(false); setEditingId(null); setForm(blankTask());
  }

  async function submitTask(event) {
    event.preventDefault();
    setError('');
    try {
      const saved = editingId ? await tasksApi.update(editingId, taskPayload(form)) : await tasksApi.create(taskPayload(form));
      setTasks((current) => editingId ? current.map((task) => task._id === editingId ? saved : task) : [...current, saved].sort((a, b) => new Date(a.scheduledAt) - new Date(b.scheduledAt)));
      closeForm();
    } catch (err) { setError(err.message); }
  }

  async function toggleTask(id) {
    try {
      const updated = await tasksApi.toggle(id);
      setTasks((current) => current.map((task) => task._id === id ? updated : task));
    } catch (err) { setError(err.message); }
  }

  async function deleteTask(id) {
    try {
      await tasksApi.remove(id);
      setTasks((current) => current.filter((task) => task._id !== id));
      setDeleteCandidate(null);
    }
    catch (err) { setError(err.message); }
  }

  function editTask(task) {
    setEditingId(task._id); setForm(toForm(task)); setFormOpen(true);
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Organiza, início"><span>✓</span> organiza</a>
        <button className="new-button" onClick={() => { setForm(blankTask()); setEditingId(null); setFormOpen(true); }}>+ Nova tarefa</button>
      </header>

      <section className="hero" id="top">
        <div><p className="eyebrow">SEU PLANEJADOR PESSOAL</p><h1>Um dia mais leve<br />começa por aqui.</h1><p className="hero-text">Organize seus compromissos, mantenha o foco e celebre cada tarefa concluída.</p></div>
        <div className="progress-card"><div className="progress-title"><span>Progresso de hoje</span><strong>{progress}%</strong></div><div className="progress-track"><span style={{ width: `${progress}%` }} /></div><p>{completed} concluída{completed === 1 ? '' : 's'} · {pending} pendente{pending === 1 ? '' : 's'}</p></div>
      </section>

      {error && <div className="alert">{error}<button onClick={() => setError('')} aria-label="Fechar aviso">×</button></div>}

      <section className="content">
        <div className="section-heading"><div><p className="eyebrow">MINHA AGENDA</p><h2>Suas tarefas</h2></div><div className="filters" aria-label="Filtrar tarefas">{[['all', 'Todas'], ['pending', 'Pendentes'], ['completed', 'Concluídas']].map(([value, label]) => <button key={value} className={filter === value ? 'active' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div></div>
        {loading ? <div className="empty-state">Carregando agenda…</div> : visibleTasks.length === 0 ? <div className="empty-state"><span>✦</span><h3>Nada por aqui ainda</h3><p>Adicione uma tarefa para começar a organizar seu dia.</p><button onClick={() => setFormOpen(true)}>Criar primeira tarefa</button></div> : <div className="task-list">{visibleTasks.map((task) => <article className={`task-card ${task.completed ? 'is-completed' : ''}`} key={task._id}><button className="check" onClick={() => toggleTask(task._id)} aria-label={task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}>{task.completed && '✓'}</button><div className="task-main"><div className="task-title-row"><h3>{task.title}</h3>{task.completed && <span className="status">Concluída</span>}</div>{task.description && <p>{task.description}</p>}<div className="schedule"><span>◷ {formatTime(task.scheduledAt)}</span><span>{formatDate(task.scheduledAt)}</span></div></div><div className="task-actions"><button onClick={() => editTask(task)} aria-label="Editar tarefa">✎</button><button onClick={() => setDeleteCandidate(task)} aria-label="Excluir tarefa">⌫</button></div></article>)}</div>}
      </section>

      {isFormOpen && <div className="modal-backdrop" role="presentation" onMouseDown={closeForm}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" onMouseDown={(event) => event.stopPropagation()}><div className="modal-header"><div><p className="eyebrow">{editingId ? 'ATUALIZAR PLANEJAMENTO' : 'NOVO PLANEJAMENTO'}</p><h2 id="modal-title">{editingId ? 'Editar tarefa' : 'Adicionar tarefa'}</h2></div><button className="icon-close" onClick={closeForm} aria-label="Fechar">×</button></div><form onSubmit={submitTask}><label>Título<input required name="title" value={form.title} onChange={updateForm} placeholder="Ex.: Revisar apresentação" maxLength="120" autoFocus /></label><label>Descrição <em>(opcional)</em><textarea name="description" value={form.description} onChange={updateForm} placeholder="Inclua detalhes que ajudem você." rows="3" maxLength="1000" /></label><div className="form-row"><label>Data<input required type="date" name="date" value={form.date} onChange={updateForm} /></label><label>Horário<input required type="time" name="time" value={form.time} onChange={updateForm} /></label></div><div className="form-actions"><button type="button" className="cancel" onClick={closeForm}>Cancelar</button><button type="submit" className="save">{editingId ? 'Salvar alterações' : 'Adicionar tarefa'}</button></div></form></section></div>}
      {deleteCandidate && <div className="modal-backdrop" role="presentation" onMouseDown={() => setDeleteCandidate(null)}><section className="modal delete-modal" role="dialog" aria-modal="true" aria-labelledby="delete-title" onMouseDown={(event) => event.stopPropagation()}><div className="delete-symbol">!</div><h2 id="delete-title">Excluir tarefa?</h2><p>Você está prestes a excluir <strong>{deleteCandidate.title}</strong>. Esta ação não poderá ser desfeita.</p><div className="form-actions"><button type="button" className="cancel" onClick={() => setDeleteCandidate(null)}>Cancelar</button><button type="button" className="delete-confirm" onClick={() => deleteTask(deleteCandidate._id)}>Excluir tarefa</button></div></section></div>}
    </main>
  );
}
