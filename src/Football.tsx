import React, { useState, useEffect } from 'react';
import { Button, Modal, Table, Form } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { GoalData, MatchData } from './types';
import { MyButton } from './Button';
import Goal from './Goal';

interface Props {
  matchesData: MatchData[];
}

const Football: React.FC<Props> = ({ matchesData }) => {
  const [league, setLeague] = useState<MatchData[]>(() => {
    const savedLeague = localStorage.getItem('league');
    return savedLeague ? JSON.parse(savedLeague) : Array.isArray(matchesData) ? matchesData : [];
  });
  const [show, setShow] = useState(false);
  const [host, setHost] = useState('');
  const [guest, setGuest] = useState('');
  const [goals, setGoals] = useState<GoalData[]>([]);
  const [editedMatchIndex, setEditedMatchIndex] = useState<number | null>(null);

  useEffect(() => {
    localStorage.setItem('league', JSON.stringify(league));
  }, [league]);

  const handleAdd = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setHost('');
    setGuest('');
    setGoals([]);
    setEditedMatchIndex(null);
  };

  const calculateGoals = (match: MatchData, team: string): number => {
    return match.Goals.filter(goal => goal.Team === team).length;
  };

  const handleSubmit = () => {
    const newMatch: MatchData = {
      Host: host,
      Guest: guest,
      Goals: goals
    };
    const updatedLeague = editedMatchIndex !== null 
      ? league.map((m, i) => i === editedMatchIndex ? newMatch : m) 
      : [...league, newMatch];

    setLeague(updatedLeague);
    handleClose();
  };

  const handleEditMatch = (matchIndex: number) => {
    const matchToUpdate = league[matchIndex];
    setHost(matchToUpdate.Host);
    setGuest(matchToUpdate.Guest);
    setGoals(matchToUpdate.Goals);
    setEditedMatchIndex(matchIndex);
    setShow(true);
  };

  const handleGoalChange = (value: string, index: number, field: keyof GoalData) => {
    const newGoals = [...goals];
    newGoals[index] = { ...newGoals[index], [field]: field === 'Time' ? parseInt(value) : value };
    setGoals(newGoals);
  };

  const handleAddGoal = () => {
    setGoals([...goals, { Time: 0, Player: '', Team: '' }]);
  };

  const handleEditGoal = (updatedGoal: GoalData, matchIndex: number, goalIndex: number) => {
    const updatedLeague = [...league];
    updatedLeague[matchIndex].Goals[goalIndex] = updatedGoal;
    setLeague(updatedLeague);
  };

  const handleDeleteGoal = (matchIndex: number, goalIndex: number) => {
    const updatedLeague = [...league];
    updatedLeague[matchIndex].Goals.splice(goalIndex, 1);
    setLeague(updatedLeague);
  };

  return (
    <>
      <Button variant="primary" onClick={handleAdd}>اضافه کردن مسابقه</Button>
      <ToastContainer />
      {league.map((m, i) => (
        <div key={i} style={{ margin: "10px" }}>
          <h3>{m.Host} ({calculateGoals(m, m.Host)}) - {m.Guest} ({calculateGoals(m, m.Guest)})</h3>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th></th>
                <th>زمان</th>
                <th>بازیکن</th>
                <th>تیم</th>
              </tr>
            </thead>
            <tbody>
              {m.Goals.map((goal, goalIndex) => (
                <Goal 
                  key={goalIndex} 
                  data={goal} 
                  onEdit={handleEditGoal} 
                  onDelete={handleDeleteGoal} 
                  matchIndex={i} 
                  goalIndex={goalIndex} 
                  host={m.Host} 
                  guest={m.Guest} 
                />
              ))}
            </tbody>
          </Table>
          <Button variant="info" onClick={() => handleEditMatch(i)}>ویرایش کلی</Button>
        </div>
      ))}
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>اضافه کردن مسابقه</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group controlId="formHost">
              <Form.Label>تیم میزبان</Form.Label>
              <Form.Control type="text" placeholder="تیم میزبان" value={host} onChange={(e) => setHost(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formGuest">
              <Form.Label>تیم مهمان</Form.Label>
              <Form.Control type="text" placeholder="تیم مهمان" value={guest} onChange={(e) => setGuest(e.target.value)} />
            </Form.Group>
            <Form.Group controlId="formGoals">
              {goals.map((goal, index) => (
                <div key={index}>
                  <Form.Group controlId={`formTime_${index}`}>
                    <Form.Label>زمان گل</Form.Label>
                    <Form.Control type="number" placeholder="زمان" value={goal.Time} onChange={(e) => handleGoalChange(e.target.value, index, 'Time')} />
                  </Form.Group>
                  <Form.Group controlId={`formPlayer_${index}`}>
                    <Form.Label>بازیکن</Form.Label>
                    <Form.Control type="text" placeholder="بازیکن" value={goal.Player} onChange={(e) => handleGoalChange(e.target.value, index, 'Player')} />
                  </Form.Group>
                  <Form.Group controlId={`formTeam_${index}`}>
                    <Form.Label>تیم</Form.Label>
                    <Form.Control as="select" value={goal.Team} onChange={(e) => handleGoalChange(e.target.value, index, 'Team')}>
                      <option value={host}>{host}</option>
                      <option value={guest}>{guest}</option>
                    </Form.Control>
                  </Form.Group>
                </div>
              ))}
              <Button variant="primary" onClick={handleAddGoal} style={{ marginBottom: '10px', marginTop: '10px' }}>افزودن گل</Button>
            </Form.Group>
            <Table striped bordered hover>
              <thead>
                <tr>
                  <th>زمان</th>
                  <th>بازیکن</th>
                  <th>تیم</th>
                </tr>
              </thead>
              <tbody>
                {goals.map((goal, index) => (
                  <tr key={index}>
                    <td>{goal.Time}</td>
                    <td>{goal.Player}</td>
                    <td>{goal.Team}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
            <MyButton variant='primary' onClick={handleSubmit} children="ذخیره" />
          </Form>
        </Modal.Body>
      </Modal>
    </>
  );
};

export default Football;
