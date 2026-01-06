import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';

type CarSkin = {
  id: string;
  name: string;
  color: string;
  price: number;
  unlocked: boolean;
};

type Car = {
  id: string;
  name: string;
  speed: number;
  handling: number;
  acceleration: number;
  maxSpeed: number;
  maxHandling: number;
  maxAcceleration: number;
  price: number;
  unlocked: boolean;
  category: 'russian' | 'premium';
  skins: CarSkin[];
  selectedSkin: string;
};

type Achievement = {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  icon: string;
};

type LeaderboardEntry = {
  rank: number;
  name: string;
  score: number;
  car: string;
};

type Player = {
  id: string;
  name: string;
  car: string;
  position: { x: number; y: number };
  rotation: number;
  speed: number;
  score: number;
  skin: string;
};

type DailyTask = {
  id: string;
  title: string;
  description: string;
  reward: number;
  progress: number;
  target: number;
  completed: boolean;
  icon: string;
};

type PromoCode = {
  code: string;
  reward: number;
  used: boolean;
};

type GameState = {
  cars: Car[];
  credits: number;
  selectedCar: string;
  settings: {
    music: number;
    sfx: number;
    sensitivity: number;
  };
  achievements: Achievement[];
  playerName: string;
  isAdmin: boolean;
  lastMoneyGrant: number;
  lastCarGrant: number;
  usedPromoCodes: string[];
  dailyTasks: DailyTask[];
  totalDrifts: number;
  totalDistance: number;
};

const PROMO_CODES: { [key: string]: number } = {
  'RELEASE': 6500,
  'NEWPLAYER': 10000,
  '3NEWCAR': 8000,
  'DRIFT2024': 15000,
  'CYBERPUNK': 25000,
};

const INITIAL_DAILY_TASKS: DailyTask[] = [
  {
    id: 'drift10',
    title: 'Мастер дрифта',
    description: 'Выполните 10 дрифтов',
    reward: 5000,
    progress: 0,
    target: 10,
    completed: false,
    icon: 'Zap',
  },
  {
    id: 'speed200',
    title: 'Гонщик',
    description: 'Разгонитесь до 200 км/ч 5 раз',
    reward: 8000,
    progress: 0,
    target: 5,
    completed: false,
    icon: 'Gauge',
  },
  {
    id: 'earn50k',
    title: 'Предприниматель',
    description: 'Заработайте 50000 рублей',
    reward: 20000,
    progress: 0,
    target: 50000,
    completed: false,
    icon: 'TrendingUp',
  },
  {
    id: 'distance',
    title: 'Путешественник',
    description: 'Проедьте 100км',
    reward: 15000,
    progress: 0,
    target: 100,
    completed: false,
    icon: 'MapPin',
  },
];

const INITIAL_CARS: Car[] = [
  {
    id: 'uaz',
    name: 'УАЗ Hunter',
    speed: 120,
    handling: 30,
    acceleration: 40,
    maxSpeed: 235,
    maxHandling: 100,
    maxAcceleration: 100,
    price: 0,
    unlocked: true,
    category: 'russian',
    selectedSkin: 'default',
    skins: [
      { id: 'default', name: 'Стандарт', color: '#00f0ff', price: 0, unlocked: true },
      { id: 'military', name: 'Военный', color: '#4a5a3e', price: 1000, unlocked: false },
      { id: 'safari', name: 'Сафари', color: '#d4a574', price: 1500, unlocked: false },
    ],
  },
  {
    id: 'lada',
    name: 'Lada 2107',
    speed: 140,
    handling: 50,
    acceleration: 60,
    maxSpeed: 235,
    maxHandling: 100,
    maxAcceleration: 100,
    price: 2000,
    unlocked: true,
    category: 'russian',
    selectedSkin: 'default',
    skins: [
      { id: 'default', name: 'Белая', color: '#ffffff', price: 0, unlocked: true },
      { id: 'cherry', name: 'Вишнёвая', color: '#8b0000', price: 800, unlocked: false },
      { id: 'taxi', name: 'Такси', color: '#ffeb3b', price: 1200, unlocked: false },
      { id: 'police', name: 'Полиция', color: '#2196f3', price: 2000, unlocked: false },
    ],
  },
  {
    id: 'zhiguli',
    name: 'Жигули 2106',
    speed: 150,
    handling: 55,
    acceleration: 65,
    maxSpeed: 235,
    maxHandling: 100,
    maxAcceleration: 100,
    price: 3500,
    unlocked: false,
    category: 'russian',
    selectedSkin: 'default',
    skins: [
      { id: 'default', name: 'Серебро', color: '#c0c0c0', price: 0, unlocked: true },
      { id: 'gold', name: 'Золото', color: '#ffd700', price: 2500, unlocked: false },
      { id: 'racing', name: 'Гоночная', color: '#ff0000', price: 3000, unlocked: false },
    ],
  },
  {
    id: 'niva',
    name: 'Lada Niva',
    speed: 130,
    handling: 70,
    acceleration: 55,
    maxSpeed: 235,
    maxHandling: 100,
    maxAcceleration: 100,
    price: 4500,
    unlocked: false,
    category: 'russian',
    selectedSkin: 'default',
    skins: [
      { id: 'default', name: 'Зелёная', color: '#2e7d32', price: 0, unlocked: true },
      { id: 'arctic', name: 'Арктика', color: '#e3f2fd', price: 2000, unlocked: false },
      { id: 'desert', name: 'Пустыня', color: '#ffab91', price: 2500, unlocked: false },
    ],
  },
  {
    id: 'vaz',
    name: 'ВАЗ 2114',
    speed: 180,
    handling: 65,
    acceleration: 80,
    maxSpeed: 235,
    maxHandling: 100,
    maxAcceleration: 100,
    price: 6000,
    unlocked: false,
    category: 'russian',
    selectedSkin: 'default',
    skins: [
      { id: 'default', name: 'Синяя', color: '#1976d2', price: 0, unlocked: true },
      { id: 'carbon', name: 'Карбон', color: '#212121', price: 3500, unlocked: false },
      { id: 'neon', name: 'Неон', color: '#e91e63', price: 4000, unlocked: false },
    ],
  },
  {
    id: 'lamborghini',
    name: 'Lamborghini Aventador',
    speed: 300,
    handling: 85,
    acceleration: 95,
    maxSpeed: 500,
    maxHandling: 100,
    maxAcceleration: 100,
    price: 250000,
    unlocked: false,
    category: 'premium',
    selectedSkin: 'default',
    skins: [
      { id: 'default', name: 'Оранжевая', color: '#ff6f00', price: 0, unlocked: true },
      { id: 'matte', name: 'Матовая чёрная', color: '#424242', price: 10000, unlocked: false },
      { id: 'chrome', name: 'Хром', color: '#b0bec5', price: 15000, unlocked: false },
      { id: 'rainbow', name: 'Радуга', color: 'linear-gradient(90deg, #ff0000, #00ff00, #0000ff)', price: 25000, unlocked: false },
    ],
  },
  {
    id: 'bugatti',
    name: 'Bugatti Chiron',
    speed: 350,
    handling: 90,
    acceleration: 98,
    maxSpeed: 500,
    maxHandling: 100,
    maxAcceleration: 100,
    price: 300000,
    unlocked: false,
    category: 'premium',
    selectedSkin: 'default',
    skins: [
      { id: 'default', name: 'Синяя', color: '#0d47a1', price: 0, unlocked: true },
      { id: 'red', name: 'Красная', color: '#c62828', price: 12000, unlocked: false },
      { id: 'gold', name: 'Золотая', color: '#f9a825', price: 20000, unlocked: false },
      { id: 'carbon', name: 'Карбон', color: '#1a1a1a', price: 30000, unlocked: false },
    ],
  },
  {
    id: 'ferrari',
    name: 'Ferrari F8 Tributo',
    speed: 320,
    handling: 88,
    acceleration: 96,
    maxSpeed: 500,
    maxHandling: 100,
    maxAcceleration: 100,
    price: 350000,
    unlocked: false,
    category: 'premium',
    selectedSkin: 'default',
    skins: [
      { id: 'default', name: 'Красная', color: '#d32f2f', price: 0, unlocked: true },
      { id: 'yellow', name: 'Жёлтая', color: '#fbc02d', price: 15000, unlocked: false },
      { id: 'white', name: 'Белая', color: '#fafafa', price: 18000, unlocked: false },
      { id: 'black', name: 'Чёрная', color: '#000000', price: 22000, unlocked: false },
    ],
  },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Первый дрифт', description: 'Выполните свой первый дрифт', completed: false, icon: 'Zap' },
  { id: '2', title: 'Коллекционер', description: 'Разблокируйте все автомобили', completed: false, icon: 'Trophy' },
  { id: '3', title: 'Король дрифта', description: 'Наберите 10000 очков за один дрифт', completed: false, icon: 'Crown' },
  { id: '4', title: 'Тюнер', description: 'Максимально улучшите любой автомобиль', completed: false, icon: 'Wrench' },
  { id: '5', title: 'Легенда', description: 'Займите 1 место в лидерборде', completed: false, icon: 'Star' },
  { id: '6', title: 'Скорость света', description: 'Разгонитесь до 500 км/ч', completed: false, icon: 'Rocket' },
  { id: '7', title: 'Миллионер', description: 'Заработайте 500000 рублей', completed: false, icon: 'BadgeDollarSign' },
  { id: '8', title: 'Стилист', description: 'Купите все скины для одной машины', completed: false, icon: 'Palette' },
  { id: '9', title: 'Премиум класс', description: 'Купите суперкар', completed: false, icon: 'Gem' },
  { id: '10', title: 'Админ', description: 'Купите админ-панель', completed: false, icon: 'ShieldCheck' },
];

const Index = () => {
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState<'home' | 'garage' | 'city' | 'leaderboard' | 'achievements' | 'settings' | 'multiplayer' | 'admin' | 'tasks'>('city');
  const [selectedCar, setSelectedCar] = useState<string>('lada');
  const [credits, setCredits] = useState(5000);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentDriftScore, setCurrentDriftScore] = useState(0);
  const [driftCombo, setDriftCombo] = useState(0);
  const [isDrifting, setIsDrifting] = useState(false);
  const [carPosition, setCarPosition] = useState({ x: 50, y: 50 });
  const [carRotation, setCarRotation] = useState(0);
  const [roadOffset, setRoadOffset] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileControls, setMobileControls] = useState({ gas: false, brake: false, left: false, right: false });
  
  const [playerName, setPlayerName] = useState('Игрок');
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [players, setPlayers] = useState<Player[]>([]);
  const [myPlayerId] = useState(`player_${Math.random().toString(36).substr(2, 9)}`);

  const [isAdmin, setIsAdmin] = useState(false);
  const [lastMoneyGrant, setLastMoneyGrant] = useState(0);
  const [lastCarGrant, setLastCarGrant] = useState(0);
  const [adminMoneyAmount, setAdminMoneyAmount] = useState(100000);
  const [promoCode, setPromoCode] = useState('');
  const [usedPromoCodes, setUsedPromoCodes] = useState<string[]>([]);
  
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(INITIAL_DAILY_TASKS);
  const [totalDrifts, setTotalDrifts] = useState(0);
  const [totalDistance, setTotalDistance] = useState(0);

  const [settings, setSettings] = useState({
    music: 70,
    sfx: 80,
    sensitivity: 50,
  });

  const [cars, setCars] = useState<Car[]>(INITIAL_CARS);
  const [achievements, setAchievements] = useState<Achievement[]>(INITIAL_ACHIEVEMENTS);

  const keysPressed = useRef<Set<string>>(new Set());
  const gameLoopRef = useRef<number>();
  const driftTimerRef = useRef<NodeJS.Timeout>();
  const lastDriftRewardRef = useRef(0);
  const multiplayerIntervalRef = useRef<NodeJS.Timeout>();

  const [leaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, name: 'DRIFT_KING_77', score: 25680, car: 'ВАЗ 2114' },
    { rank: 2, name: 'NeonRacer', score: 23450, car: 'Жигули 2106' },
    { rank: 3, name: 'CyberDriver', score: 21230, car: 'Lada Niva' },
    { rank: 4, name: 'RussianDrift', score: 19880, car: 'Lada 2107' },
    { rank: 5, name: 'MoscowNights', score: 18560, car: 'ВАЗ 2114' },
  ]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent));
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const savedState = localStorage.getItem('driftCarRussiaState');
    if (savedState) {
      try {
        const parsed: GameState = JSON.parse(savedState);
        setCars(parsed.cars);
        setCredits(parsed.credits);
        setSelectedCar(parsed.selectedCar);
        setSettings(parsed.settings);
        setAchievements(parsed.achievements);
        if (parsed.playerName) setPlayerName(parsed.playerName);
        if (parsed.isAdmin !== undefined) setIsAdmin(parsed.isAdmin);
        if (parsed.lastMoneyGrant) setLastMoneyGrant(parsed.lastMoneyGrant);
        if (parsed.lastCarGrant) setLastCarGrant(parsed.lastCarGrant);
        if (parsed.usedPromoCodes) setUsedPromoCodes(parsed.usedPromoCodes);
        if (parsed.dailyTasks) setDailyTasks(parsed.dailyTasks);
        if (parsed.totalDrifts) setTotalDrifts(parsed.totalDrifts);
        if (parsed.totalDistance) setTotalDistance(parsed.totalDistance);
      } catch (e) {
        console.error('Failed to load saved state:', e);
      }
    }
  }, []);

  useEffect(() => {
    const stateToSave: GameState = {
      cars,
      credits,
      selectedCar,
      settings,
      achievements,
      playerName,
      isAdmin,
      lastMoneyGrant,
      lastCarGrant,
      usedPromoCodes,
      dailyTasks,
      totalDrifts,
      totalDistance,
    };
    localStorage.setItem('driftCarRussiaState', JSON.stringify(stateToSave));
  }, [cars, credits, selectedCar, settings, achievements, playerName, isAdmin, lastMoneyGrant, lastCarGrant, usedPromoCodes, dailyTasks, totalDrifts, totalDistance]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright', ' '].includes(key)) {
        e.preventDefault();
        keysPressed.current.add(key);
      }
      if (key === 'escape' && currentSection === 'city') {
        setCurrentSection('home');
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      keysPressed.current.delete(key);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [currentSection]);

  useEffect(() => {
    if (isMultiplayer && roomCode) {
      multiplayerIntervalRef.current = setInterval(() => {
        const myPlayer: Player = {
          id: myPlayerId,
          name: playerName,
          car: selectedCar,
          position: carPosition,
          rotation: carRotation,
          speed: currentSpeed,
          score: currentDriftScore,
          skin: cars.find(c => c.id === selectedCar)?.selectedSkin || 'default',
        };

        const storedPlayers = localStorage.getItem(`multiplayer_room_${roomCode}`);
        let roomPlayers: Player[] = storedPlayers ? JSON.parse(storedPlayers) : [];
        
        roomPlayers = roomPlayers.filter(p => p.id !== myPlayerId);
        roomPlayers.push(myPlayer);
        
        if (roomPlayers.length > 5) {
          roomPlayers = roomPlayers.slice(-5);
        }

        localStorage.setItem(`multiplayer_room_${roomCode}`, JSON.stringify(roomPlayers));
        setPlayers(roomPlayers.filter(p => p.id !== myPlayerId));
      }, 100);

      return () => {
        if (multiplayerIntervalRef.current) {
          clearInterval(multiplayerIntervalRef.current);
        }
      };
    }
  }, [isMultiplayer, roomCode, carPosition, carRotation, currentSpeed, currentDriftScore, myPlayerId, playerName, selectedCar, cars]);

  const updateTaskProgress = (taskId: string, amount: number) => {
    setDailyTasks(prev => prev.map(task => {
      if (task.id === taskId && !task.completed) {
        const newProgress = task.progress + amount;
        if (newProgress >= task.target) {
          setCredits(c => c + task.reward);
          toast({
            title: '✅ Задание выполнено!',
            description: `${task.title} - награда ${task.reward}₽`,
          });
          playSound('achievement');
          return { ...task, progress: task.target, completed: true };
        }
        return { ...task, progress: newProgress };
      }
      return task;
    }));
  };

  const unlockAchievement = (achievementId: string) => {
    const achievement = achievements.find(a => a.id === achievementId);
    if (achievement && !achievement.completed) {
      setAchievements(prev => prev.map(a => 
        a.id === achievementId ? { ...a, completed: true } : a
      ));
      toast({
        title: '🏆 Достижение разблокировано!',
        description: achievement.title,
      });
      playSound('achievement');
    }
  };

  const playSound = (type: 'drift' | 'upgrade' | 'achievement' | 'button' | 'reward') => {
    if (settings.sfx === 0) return;
    
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    gainNode.gain.value = settings.sfx / 100 * 0.3;
    
    switch (type) {
      case 'drift':
        oscillator.frequency.value = 150;
        oscillator.type = 'sawtooth';
        break;
      case 'upgrade':
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        break;
      case 'achievement':
        oscillator.frequency.value = 1000;
        oscillator.type = 'triangle';
        break;
      case 'button':
        oscillator.frequency.value = 400;
        oscillator.type = 'square';
        break;
      case 'reward':
        oscillator.frequency.value = 1200;
        oscillator.type = 'sine';
        break;
    }
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.15);
  };

  const calculateDriftReward = (score: number): number => {
    if (score >= 3000) return 3000;
    if (score >= 2000) return 1000;
    if (score >= 1000) return 500;
    return 0;
  };

  const activatePromoCode = () => {
    const code = promoCode.toUpperCase();
    
    if (usedPromoCodes.includes(code)) {
      toast({
        title: '❌ Промокод уже использован',
        description: 'Этот код можно использовать только один раз',
        variant: 'destructive',
      });
      return;
    }

    const reward = PROMO_CODES[code];
    if (reward) {
      setCredits(prev => prev + reward);
      setUsedPromoCodes(prev => [...prev, code]);
      setPromoCode('');
      toast({
        title: '✅ Промокод активирован!',
        description: `Получено ${reward}₽`,
      });
      playSound('reward');
    } else {
      toast({
        title: '❌ Неверный промокод',
        description: 'Проверьте правильность ввода',
        variant: 'destructive',
      });
    }
  };

  const buyAdminPanel = () => {
    if (credits >= 1000000000) {
      setCredits(prev => prev - 1000000000);
      setIsAdmin(true);
      unlockAchievement('10');
      toast({
        title: '👑 АДМИН-ПАНЕЛЬ АКТИВИРОВАНА!',
        description: 'Теперь у вас есть неограниченные возможности!',
      });
      playSound('achievement');
    } else {
      toast({
        title: '💸 Недостаточно средств',
        description: `Нужно ${(1000000000 - credits).toLocaleString()}₽`,
        variant: 'destructive',
      });
    }
  };

  const grantMoney = () => {
    const now = Date.now();
    if (now - lastMoneyGrant < 10000) {
      const remaining = Math.ceil((10000 - (now - lastMoneyGrant)) / 1000);
      toast({
        title: '⏳ Подождите',
        description: `Следующая выдача через ${remaining} сек`,
        variant: 'destructive',
      });
      return;
    }

    const amount = Math.min(adminMoneyAmount, 1000000);
    setCredits(prev => prev + amount);
    setLastMoneyGrant(now);
    toast({
      title: '💰 Деньги выданы!',
      description: `+${amount.toLocaleString()}₽`,
    });
    playSound('reward');
  };

  const grantCar = (carId: string) => {
    const now = Date.now();
    if (now - lastCarGrant < 60000) {
      const remaining = Math.ceil((60000 - (now - lastCarGrant)) / 1000);
      toast({
        title: '⏳ Подождите',
        description: `Следующая выдача через ${remaining} сек`,
        variant: 'destructive',
      });
      return;
    }

    setCars(prev => prev.map(c => 
      c.id === carId ? { ...c, unlocked: true } : c
    ));
    setLastCarGrant(now);
    toast({
      title: '🚗 Машина выдана!',
      description: cars.find(c => c.id === carId)?.name,
    });
    playSound('upgrade');
  };

  const unlockAll = () => {
    setCars(prev => prev.map(c => ({
      ...c,
      unlocked: true,
      speed: c.maxSpeed,
      handling: c.maxHandling,
      acceleration: c.maxAcceleration,
      skins: c.skins.map(s => ({ ...s, unlocked: true })),
    })));
    setAchievements(prev => prev.map(a => ({ ...a, completed: true })));
    setDailyTasks(prev => prev.map(t => ({ ...t, completed: true, progress: t.target })));
    toast({
      title: '🌟 ВСЁ РАЗБЛОКИРОВАНО!',
      description: 'Все машины, скины, улучшения и достижения',
    });
    playSound('achievement');
  };

  const updateCarPosition = () => {
    const car = cars.find(c => c.id === selectedCar);
    if (!car) return;

    let targetSpeed = 0;
    let newRotation = carRotation;
    let isDriftingNow = false;

    const maxSpeedKmh = car.speed;
    const acceleration = car.acceleration / 10;
    const handling = car.handling / 50;

    const isGasPressed = keysPressed.current.has('w') || keysPressed.current.has('arrowup') || mobileControls.gas;
    const isBrakePressed = keysPressed.current.has('s') || keysPressed.current.has('arrowdown') || mobileControls.brake;
    const isLeftPressed = keysPressed.current.has('a') || keysPressed.current.has('arrowleft') || mobileControls.left;
    const isRightPressed = keysPressed.current.has('d') || keysPressed.current.has('arrowright') || mobileControls.right;

    if (isGasPressed) {
      targetSpeed = maxSpeedKmh;
    }
    if (isBrakePressed) {
      targetSpeed = -maxSpeedKmh * 0.5;
    }

    const speedDiff = targetSpeed - currentSpeed;
    const newSpeed = currentSpeed + Math.sign(speedDiff) * Math.min(Math.abs(speedDiff), acceleration);
    setCurrentSpeed(newSpeed);

    if (isLeftPressed) {
      const turnSpeed = handling * (Math.abs(currentSpeed) / maxSpeedKmh);
      newRotation -= turnSpeed;
      if (Math.abs(currentSpeed) > maxSpeedKmh * 0.3) {
        isDriftingNow = true;
      }
    }
    if (isRightPressed) {
      const turnSpeed = handling * (Math.abs(currentSpeed) / maxSpeedKmh);
      newRotation += turnSpeed;
      if (Math.abs(currentSpeed) > maxSpeedKmh * 0.3) {
        isDriftingNow = true;
      }
    }

    if (keysPressed.current.has(' ')) {
      const newSpeedWithBrake = currentSpeed * 0.95;
      setCurrentSpeed(newSpeedWithBrake);
    }

    setCarRotation(newRotation % 360);
    setRoadOffset(prev => (prev + currentSpeed * 0.1) % 1000);
    
    const distance = Math.abs(currentSpeed) * 0.05 / 1000;
    setTotalDistance(prev => prev + distance);
    updateTaskProgress('distance', distance);

    if (Math.abs(currentSpeed) >= 200) {
      updateTaskProgress('speed200', 1);
    }

    if (isDriftingNow && Math.abs(currentSpeed) > 0) {
      const driftPoints = Math.floor(Math.abs(currentSpeed) / 5) * (1 + driftCombo * 0.15);
      setCurrentDriftScore(prev => prev + driftPoints);
      setDriftCombo(prev => Math.min(prev + 1, 20));
      
      if (!isDrifting) {
        setIsDrifting(true);
        playSound('drift');
        setTotalDrifts(prev => prev + 1);
        updateTaskProgress('drift10', 1);
        if (!achievements.find(a => a.id === '1')?.completed) {
          unlockAchievement('1');
        }
      }

      if (driftTimerRef.current) {
        clearTimeout(driftTimerRef.current);
      }

      driftTimerRef.current = setTimeout(() => {
        const finalScore = currentDriftScore;
        const reward = calculateDriftReward(finalScore);
        
        if (reward > 0 && finalScore !== lastDriftRewardRef.current) {
          setCredits(prev => prev + reward);
          setTotalEarnings(prev => {
            const newTotal = prev + reward;
            updateTaskProgress('earn50k', reward);
            return newTotal;
          });
          lastDriftRewardRef.current = finalScore;
          playSound('reward');
          
          toast({
            title: `💰 +${reward}₽`,
            description: `Дрифт на ${finalScore.toFixed(0)} очков!`,
          });

          if (finalScore >= 10000) {
            unlockAchievement('3');
          }
        }

        setCurrentDriftScore(0);
        setIsDrifting(false);
        setDriftCombo(0);
      }, 1500);
    } else if (isDrifting && !isDriftingNow) {
      setDriftCombo(prev => Math.max(0, prev - 1));
    }

    if (Math.abs(currentSpeed) >= maxSpeedKmh * 0.99 && maxSpeedKmh >= 500) {
      unlockAchievement('6');
    }

    if (totalEarnings >= 500000) {
      unlockAchievement('7');
    }
  };

  useEffect(() => {
    if (currentSection === 'city') {
      gameLoopRef.current = window.setInterval(updateCarPosition, 50);
      return () => {
        if (gameLoopRef.current) {
          clearInterval(gameLoopRef.current);
        }
      };
    }
  }, [currentSection, currentSpeed, carRotation, selectedCar, isDrifting, currentDriftScore, driftCombo, mobileControls, totalDistance]);

  const upgradeCar = (carId: string, stat: 'speed' | 'handling' | 'acceleration') => {
    const car = cars.find(c => c.id === carId);
    if (!car) return;

    const upgradeCost = car.category === 'premium' ? 5000 : 500;
    const maxValue = stat === 'speed' ? car.maxSpeed : stat === 'handling' ? car.maxHandling : car.maxAcceleration;
    const currentValue = car[stat];
    const upgradeAmount = car.category === 'premium' ? 20 : 10;

    if (credits >= upgradeCost && currentValue < maxValue) {
      setCars(cars.map(c => 
        c.id === carId 
          ? { ...c, [stat]: Math.min(currentValue + upgradeAmount, maxValue) }
          : c
      ));
      setCredits(credits - upgradeCost);
      playSound('upgrade');

      const updatedCars = cars.map(c => 
        c.id === carId 
          ? { ...c, [stat]: Math.min(currentValue + upgradeAmount, maxValue) }
          : c
      );
      const upgradedCar = updatedCars.find(c => c.id === carId);
      if (upgradedCar && upgradedCar.speed === maxValue && upgradedCar.handling === maxValue && upgradedCar.acceleration === maxValue) {
        unlockAchievement('4');
      }
    }
  };

  const unlockCar = (carId: string) => {
    const car = cars.find(c => c.id === carId);
    if (!car || car.unlocked) return;

    if (credits >= car.price) {
      setCars(cars.map(c => 
        c.id === carId ? { ...c, unlocked: true } : c
      ));
      setCredits(credits - car.price);
      playSound('upgrade');

      if (car.category === 'premium') {
        unlockAchievement('9');
      }

      if (cars.filter(c => c.unlocked).length + 1 === cars.length) {
        unlockAchievement('2');
      }
    }
  };

  const unlockSkin = (carId: string, skinId: string) => {
    const car = cars.find(c => c.id === carId);
    const skin = car?.skins.find(s => s.id === skinId);
    
    if (!car || !skin || skin.unlocked) return;

    if (credits >= skin.price) {
      setCars(cars.map(c => 
        c.id === carId 
          ? { 
              ...c, 
              skins: c.skins.map(s => 
                s.id === skinId ? { ...s, unlocked: true } : s
              )
            }
          : c
      ));
      setCredits(credits - skin.price);
      playSound('upgrade');

      const updatedCar = cars.find(c => c.id === carId);
      if (updatedCar && updatedCar.skins.every(s => s.unlocked || s.id === skinId)) {
        unlockAchievement('8');
      }
    }
  };

  const selectSkin = (carId: string, skinId: string) => {
    setCars(cars.map(c => 
      c.id === carId ? { ...c, selectedSkin: skinId } : c
    ));
    playSound('button');
  };

  const resetProgress = () => {
    setCars(INITIAL_CARS);
    setCredits(5000);
    setSelectedCar('lada');
    setAchievements(INITIAL_ACHIEVEMENTS);
    setSettings({ music: 70, sfx: 80, sensitivity: 50 });
    setTotalEarnings(0);
    setIsAdmin(false);
    setUsedPromoCodes([]);
    setDailyTasks(INITIAL_DAILY_TASKS);
    setTotalDrifts(0);
    setTotalDistance(0);
    localStorage.removeItem('driftCarRussiaState');
    toast({
      title: '🔄 Прогресс сброшен',
      description: 'Все данные удалены',
    });
  };

  const createRoom = () => {
    const newRoomCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    setRoomCode(newRoomCode);
    setIsMultiplayer(true);
    localStorage.setItem(`multiplayer_room_${newRoomCode}`, JSON.stringify([]));
    toast({
      title: '🎮 Комната создана!',
      description: `Код комнаты: ${newRoomCode}`,
    });
    setCurrentSection('city');
  };

  const joinRoom = (code: string) => {
    if (code.length === 6) {
      setRoomCode(code);
      setIsMultiplayer(true);
      toast({
        title: '🎮 Подключение к комнате...',
        description: `Код: ${code}`,
      });
      setCurrentSection('city');
    }
  };

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center space-y-8 max-w-4xl">
        <h1 className="font-orbitron text-6xl md:text-8xl font-black neon-text-cyan tracking-wider animate-glitch">
          DRIFT CAR RUSSIA
        </h1>
        <p className="font-roboto text-xl md:text-2xl neon-text-magenta">
          Открытый мир • Киберпанк • Неоновые ночи
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12">
          {['city', 'multiplayer', 'garage', 'tasks', 'leaderboard', 'achievements', ...(isAdmin ? ['admin'] : []), 'settings'].map((section) => {
            const icons = {
              garage: 'Car',
              city: 'Gamepad2',
              leaderboard: 'Trophy',
              achievements: 'Award',
              settings: 'Settings',
              multiplayer: 'Users',
              admin: 'ShieldCheck',
              tasks: 'Target',
            };
            const labels = {
              garage: 'Гараж',
              city: 'Открытый мир',
              leaderboard: 'Лидерборд',
              achievements: 'Достижения',
              settings: 'Настройки',
              multiplayer: 'Мультиплеер',
              admin: 'АДМИН',
              tasks: 'Задания',
            };
            return (
              <Button
                key={section}
                onClick={() => {
                  setCurrentSection(section as any);
                  playSound('button');
                }}
                className={`h-24 text-lg md:text-xl font-orbitron bg-card hover:bg-card/80 border-2 transition-all hover:scale-105 ${
                  section === 'admin' ? 'neon-border-magenta' : 'neon-border-cyan'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon name={icons[section as keyof typeof icons] as any} size={32} className={section === 'admin' ? 'neon-text-magenta' : 'neon-text-cyan'} />
                  <span className="neon-text-purple text-sm md:text-base">{labels[section as keyof typeof labels]}</span>
                </div>
              </Button>
            );
          })}
        </div>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Icon name="Coins" className="neon-text-magenta" size={32} />
          <span className="font-orbitron text-2xl md:text-3xl neon-text-cyan">{credits.toLocaleString()} ₽</span>
        </div>
        {!isAdmin && (
          <Button
            onClick={buyAdminPanel}
            disabled={credits < 1000000000}
            className="mt-8 h-16 text-xl font-orbitron neon-border-magenta border-2 hover:scale-105 transition-all"
          >
            <Icon name="Crown" className="mr-2" size={24} />
            Купить АДМИН-ПАНЕЛЬ (1,000,000,000₽)
          </Button>
        )}
      </div>
    </div>
  );

  const renderAdmin = () => (
    <div className="min-h-screen p-4 md:p-8">
      <Button
        onClick={() => {
          setCurrentSection('home');
          playSound('button');
        }}
        className="mb-6 neon-border-cyan border-2 font-orbitron"
      >
        <Icon name="ArrowLeft" className="mr-2" />
        Назад
      </Button>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="text-center mb-8">
          <h2 className="font-orbitron text-4xl neon-text-magenta mb-2">👑 АДМИН-ПАНЕЛЬ</h2>
          <p className="font-roboto neon-text-cyan">Неограниченная власть</p>
        </div>

        <Tabs defaultValue="money" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="money" className="font-orbitron">Деньги</TabsTrigger>
            <TabsTrigger value="cars" className="font-orbitron">Машины</TabsTrigger>
            <TabsTrigger value="all" className="font-orbitron">Всё</TabsTrigger>
          </TabsList>

          <TabsContent value="money" className="space-y-4">
            <Card className="p-6 border-2 neon-border-cyan">
              <h3 className="font-orbitron text-2xl neon-text-cyan mb-4">💰 Выдать деньги</h3>
              <div className="space-y-4">
                <div>
                  <label className="font-roboto neon-text-purple mb-2 block">Сумма (макс. 1,000,000₽)</label>
                  <Input
                    type="number"
                    value={adminMoneyAmount}
                    onChange={(e) => setAdminMoneyAmount(Math.min(Number(e.target.value), 1000000))}
                    className="font-orbitron neon-border-magenta border-2"
                    max={1000000}
                  />
                </div>
                <Button
                  onClick={grantMoney}
                  className="w-full h-16 text-xl font-orbitron neon-border-cyan border-2"
                >
                  <Icon name="BadgeDollarSign" className="mr-2" size={24} />
                  Выдать (раз в 10 сек)
                </Button>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="cars" className="space-y-4">
            <Card className="p-6 border-2 neon-border-cyan">
              <h3 className="font-orbitron text-2xl neon-text-cyan mb-4">🚗 Выдать машину</h3>
              <div className="space-y-3">
                {cars.map(car => (
                  <Button
                    key={car.id}
                    onClick={() => grantCar(car.id)}
                    disabled={car.unlocked}
                    className="w-full font-orbitron neon-border-magenta border"
                  >
                    <Icon name="Car" className="mr-2" />
                    {car.name} {car.unlocked && '✓'}
                  </Button>
                ))}
                <p className="text-sm font-roboto neon-text-purple text-center mt-4">
                  Выдача раз в минуту
                </p>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            <Card className="p-6 border-2 neon-border-magenta">
              <h3 className="font-orbitron text-2xl neon-text-magenta mb-4">🌟 ПОЛУЧИТЬ ВСЁ</h3>
              <div className="space-y-4">
                <div className="font-roboto text-sm neon-text-purple space-y-2">
                  <p>• Все машины разблокированы</p>
                  <p>• Все улучшения максимальны</p>
                  <p>• Все скины куплены</p>
                  <p>• Все достижения получены</p>
                  <p>• Все задания выполнены</p>
                </div>
                <Button
                  onClick={unlockAll}
                  className="w-full h-20 text-2xl font-orbitron neon-border-magenta border-2 hover:scale-105 transition-all"
                >
                  <Icon name="Sparkles" className="mr-2" size={32} />
                  РАЗБЛОКИРОВАТЬ ВСЁ
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );

  const renderTasks = () => (
    <div className="min-h-screen p-4 md:p-8">
      <Button
        onClick={() => {
          setCurrentSection('home');
          playSound('button');
        }}
        className="mb-6 neon-border-cyan border-2 font-orbitron"
      >
        <Icon name="ArrowLeft" className="mr-2" />
        Назад
      </Button>

      <div className="max-w-4xl mx-auto">
        <h2 className="font-orbitron text-4xl neon-text-cyan mb-8 text-center">ЗАДАНИЯ</h2>

        <Card className="p-6 border-2 neon-border-cyan mb-6">
          <h3 className="font-orbitron text-xl neon-text-magenta mb-4">🎁 ПРОМОКОДЫ</h3>
          <div className="flex gap-2 mb-4">
            <Input
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
              placeholder="ВВЕДИТЕ КОД"
              className="font-orbitron neon-border-magenta border-2 uppercase"
              maxLength={20}
            />
            <Button
              onClick={activatePromoCode}
              disabled={!promoCode}
              className="neon-border-cyan border-2 font-orbitron"
            >
              <Icon name="Gift" size={20} />
            </Button>
          </div>
          <div className="text-sm font-roboto neon-text-purple space-y-1">
            <p>Активные коды:</p>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(PROMO_CODES).map(([code, reward]) => (
                <div key={code} className={usedPromoCodes.includes(code) ? 'opacity-50 line-through' : ''}>
                  {code} - {reward}₽
                </div>
              ))}
            </div>
          </div>
        </Card>

        <div className="space-y-4">
          {dailyTasks.map(task => (
            <Card
              key={task.id}
              className={`p-6 border-2 transition-all ${
                task.completed ? 'neon-border-cyan opacity-60' : 'neon-border-magenta'
              }`}
            >
              <div className="flex items-start gap-4">
                <Icon name={task.icon as any} size={48} className={task.completed ? 'neon-text-cyan' : 'neon-text-magenta'} />
                <div className="flex-1">
                  <h3 className="font-orbitron text-xl neon-text-purple mb-2">{task.title}</h3>
                  <p className="font-roboto text-sm text-muted-foreground mb-3">{task.description}</p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm font-roboto">
                      <span className="neon-text-cyan">{task.progress.toFixed(0)}/{task.target}</span>
                      <span className="neon-text-magenta">Награда: {task.reward}₽</span>
                    </div>
                    <Progress value={(task.progress / task.target) * 100} className="h-2" />
                  </div>
                  {task.completed && (
                    <Badge className="mt-3 bg-primary font-orbitron">✓ Выполнено</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const CarModel3D = ({ car, skin }: { car: Car; skin: CarSkin }) => {
    const bodyColor = skin.color.startsWith('linear-gradient') ? '#ff6f00' : skin.color;
    
    return (
      <div className="relative w-full h-48 flex items-center justify-center">
        <svg viewBox="0 0 400 200" className="w-full h-full">
          <defs>
            <linearGradient id={`bodyGradient-${car.id}-${skin.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: bodyColor, stopOpacity: 1 }} />
              <stop offset="50%" style={{ stopColor: bodyColor, stopOpacity: 0.8 }} />
              <stop offset="100%" style={{ stopColor: bodyColor, stopOpacity: 0.6 }} />
            </linearGradient>
            <filter id={`glow-${car.id}-${skin.id}`}>
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
            <linearGradient id="windowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" style={{ stopColor: '#87ceeb', stopOpacity: 0.6 }} />
              <stop offset="100%" style={{ stopColor: '#1e90ff', stopOpacity: 0.8 }} />
            </linearGradient>
          </defs>
          
          {car.category === 'russian' ? (
            <>
              <ellipse cx="120" cy="165" rx="25" ry="25" fill="#1a1a1a" stroke="#333" strokeWidth="3"/>
              <ellipse cx="120" cy="165" rx="15" ry="15" fill="#444" stroke="#666" strokeWidth="2"/>
              <circle cx="120" cy="165" r="5" fill="#888"/>
              
              <ellipse cx="280" cy="165" rx="25" ry="25" fill="#1a1a1a" stroke="#333" strokeWidth="3"/>
              <ellipse cx="280" cy="165" rx="15" ry="15" fill="#444" stroke="#666" strokeWidth="2"/>
              <circle cx="280" cy="165" r="5" fill="#888"/>
              
              <path d="M 80 140 Q 80 100 100 90 L 160 90 L 180 70 L 260 70 Q 280 70 290 90 L 320 90 Q 340 100 340 140 L 340 165 L 300 165 L 300 155 L 100 155 L 100 165 L 60 165 Z" 
                    fill={`url(#bodyGradient-${car.id}-${skin.id})`} 
                    stroke="#000" 
                    strokeWidth="2"
                    filter={`url(#glow-${car.id}-${skin.id})`}/>
              
              <path d="M 105 90 L 155 90 L 170 75 L 105 75 Z" fill="url(#windowGradient)" stroke="#000" strokeWidth="1.5"/>
              <path d="M 175 75 L 255 75 L 270 90 L 175 90 Z" fill="url(#windowGradient)" stroke="#000" strokeWidth="1.5"/>
              
              <rect x="85" y="150" width="15" height="8" fill="#ffeb3b" stroke="#ffa000" strokeWidth="1" rx="2"/>
              <rect x="300" y="150" width="15" height="8" fill="#f44336" stroke="#c62828" strokeWidth="1" rx="2"/>
              
              <rect x="290" y="135" width="30" height="12" fill="#1a1a1a" stroke="#333" strokeWidth="1" rx="2"/>
              <rect x="80" y="135" width="30" height="12" fill="#1a1a1a" stroke="#333" strokeWidth="1" rx="2"/>
              
              <line x1="160" y1="85" x2="160" y2="95" stroke="#000" strokeWidth="2"/>
              <line x1="180" y1="75" x2="180" y1="90" stroke="#000" strokeWidth="2"/>
            </>
          ) : (
            <>
              <ellipse cx="130" cy="170" rx="28" ry="28" fill="#1a1a1a" stroke="#333" strokeWidth="3"/>
              <ellipse cx="130" cy="170" rx="18" ry="18" fill="#444" stroke="#666" strokeWidth="2"/>
              <ellipse cx="130" cy="170" rx="12" ry="12" fill="#666"/>
              <circle cx="130" cy="170" r="6" fill="#999"/>
              
              <ellipse cx="270" cy="170" rx="28" ry="28" fill="#1a1a1a" stroke="#333" strokeWidth="3"/>
              <ellipse cx="270" cy="170" rx="18" ry="18" fill="#444" stroke="#666" strokeWidth="2"/>
              <ellipse cx="270" cy="170" rx="12" ry="12" fill="#666"/>
              <circle cx="270" cy="170" r="6" fill="#999"/>
              
              <path d="M 90 145 Q 90 90 110 75 L 150 75 L 170 55 L 250 55 Q 270 55 285 70 L 310 70 Q 330 80 330 120 L 335 145 Q 335 155 330 160 L 290 160 L 290 150 L 110 150 L 110 160 L 70 160 Q 65 155 65 145 Z" 
                    fill={`url(#bodyGradient-${car.id}-${skin.id})`} 
                    stroke="#000" 
                    strokeWidth="2"
                    filter={`url(#glow-${car.id}-${skin.id})`}/>
              
              <path d="M 115 75 L 145 75 L 165 60 L 115 60 Z" fill="url(#windowGradient)" stroke="#000" strokeWidth="1.5" opacity="0.9"/>
              <path d="M 170 60 L 245 60 L 265 75 L 175 75 Z" fill="url(#windowGradient)" stroke="#000" strokeWidth="1.5" opacity="0.9"/>
              
              <ellipse cx="95" cy="145" rx="20" ry="8" fill="#ffeb3b" opacity="0.9"/>
              <ellipse cx="305" cy="145" rx="20" ry="8" fill="#f44336" opacity="0.9"/>
              
              <path d="M 310 125 L 330 125 L 328 140 L 312 140 Z" fill="#1a1a1a" stroke="#333" strokeWidth="1"/>
              <path d="M 70 125 L 90 125 L 88 140 L 72 140 Z" fill="#1a1a1a" stroke="#333" strokeWidth="1"/>
              
              <path d="M 200 50 L 220 50 L 218 58 L 202 58 Z" fill="#f44336" opacity="0.8"/>
              
              <line x1="165" y1="68" x2="165" y2="78" stroke="#000" strokeWidth="1.5" opacity="0.5"/>
            </>
          )}
        </svg>
      </div>
    );
  };

  const renderGarage = () => (
    <div className="min-h-screen p-4 md:p-8">
      <Button
        onClick={() => {
          setCurrentSection('home');
          playSound('button');
        }}
        className="mb-6 neon-border-cyan border-2 font-orbitron"
      >
        <Icon name="ArrowLeft" className="mr-2" />
        Назад
      </Button>

      <div className="max-w-6xl mx-auto">
        <h2 className="font-orbitron text-4xl neon-text-cyan mb-8 text-center">ГАРАЖ</h2>

        <Tabs defaultValue="russian" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="russian" className="font-orbitron">Русские машины</TabsTrigger>
            <TabsTrigger value="premium" className="font-orbitron">Суперкары</TabsTrigger>
          </TabsList>

          {['russian', 'premium'].map((category) => (
            <TabsContent key={category} value={category} className="space-y-6">
              {cars.filter(c => c.category === category).map((car) => {
                const currentSkin = car.skins.find(s => s.id === car.selectedSkin) || car.skins[0];
                
                return (
                  <Card key={car.id} className={`p-6 border-2 ${car.id === selectedCar ? 'neon-border-magenta' : 'neon-border-cyan'}`}>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h3 className="font-orbitron text-2xl neon-text-purple mb-4">{car.name}</h3>
                        <CarModel3D car={car} skin={currentSkin} />
                        
                        {car.unlocked && (
                          <div className="mt-4 space-y-2">
                            <p className="font-roboto text-sm neon-text-cyan mb-2">Скины ({car.skins.filter(s => s.unlocked).length}/{car.skins.length})</p>
                            <div className="grid grid-cols-3 gap-2">
                              {car.skins.map((skin) => (
                                <button
                                  key={skin.id}
                                  onClick={() => skin.unlocked ? selectSkin(car.id, skin.id) : skin.price > 0 && unlockSkin(car.id, skin.id)}
                                  disabled={!skin.unlocked && credits < skin.price}
                                  className={`h-16 rounded border-2 transition-all flex flex-col items-center justify-center ${
                                    car.selectedSkin === skin.id ? 'neon-border-magenta scale-105' : 'border-muted'
                                  } ${!skin.unlocked && 'opacity-50'}`}
                                  style={{ backgroundColor: skin.color.startsWith('linear') ? '#ff6f00' : skin.color }}
                                >
                                  <span className="text-xs font-roboto text-white drop-shadow-lg">{skin.name}</span>
                                  {!skin.unlocked && skin.price > 0 && (
                                    <span className="text-xs font-orbitron text-white drop-shadow-lg">{skin.price}₽</span>
                                  )}
                                  {car.selectedSkin === skin.id && <span className="text-lg">✓</span>}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="space-y-4">
                        {!car.unlocked ? (
                          <div className="space-y-4">
                            <div className="text-center">
                              <p className="font-orbitron text-3xl neon-text-magenta mb-2">{car.price.toLocaleString()} ₽</p>
                              <Button
                                onClick={() => unlockCar(car.id)}
                                disabled={credits < car.price}
                                className="w-full h-16 text-xl font-orbitron neon-border-cyan border-2"
                              >
                                <Icon name="ShoppingCart" className="mr-2" size={24} />
                                Купить
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="font-roboto neon-text-cyan">Скорость: {car.speed} км/ч</span>
                                <span className="font-roboto neon-text-purple">{car.maxSpeed} км/ч</span>
                              </div>
                              <Progress value={(car.speed / car.maxSpeed) * 100} className="h-3 mb-2" />
                              <Button
                                onClick={() => upgradeCar(car.id, 'speed')}
                                disabled={car.speed >= car.maxSpeed || credits < (car.category === 'premium' ? 5000 : 500)}
                                className="w-full font-orbitron"
                                size="sm"
                              >
                                Улучшить ({car.category === 'premium' ? '5000' : '500'}₽)
                              </Button>
                            </div>

                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="font-roboto neon-text-cyan">Управление: {car.handling}</span>
                                <span className="font-roboto neon-text-purple">{car.maxHandling}</span>
                              </div>
                              <Progress value={(car.handling / car.maxHandling) * 100} className="h-3 mb-2" />
                              <Button
                                onClick={() => upgradeCar(car.id, 'handling')}
                                disabled={car.handling >= car.maxHandling || credits < (car.category === 'premium' ? 5000 : 500)}
                                className="w-full font-orbitron"
                                size="sm"
                              >
                                Улучшить ({car.category === 'premium' ? '5000' : '500'}₽)
                              </Button>
                            </div>

                            <div>
                              <div className="flex justify-between mb-2">
                                <span className="font-roboto neon-text-cyan">Ускорение: {car.acceleration}</span>
                                <span className="font-roboto neon-text-purple">{car.maxAcceleration}</span>
                              </div>
                              <Progress value={(car.acceleration / car.maxAcceleration) * 100} className="h-3 mb-2" />
                              <Button
                                onClick={() => upgradeCar(car.id, 'acceleration')}
                                disabled={car.acceleration >= car.maxAcceleration || credits < (car.category === 'premium' ? 5000 : 500)}
                                className="w-full font-orbitron"
                                size="sm"
                              >
                                Улучшить ({car.category === 'premium' ? '5000' : '500'}₽)
                              </Button>
                            </div>

                            <Button
                              onClick={() => {
                                setSelectedCar(car.id);
                                playSound('button');
                                toast({ title: `🚗 ${car.name}`, description: 'Выбрана для поездки' });
                              }}
                              disabled={car.id === selectedCar}
                              className="w-full h-14 text-lg font-orbitron neon-border-magenta border-2"
                            >
                              {car.id === selectedCar ? '✓ Выбрана' : 'Выбрать'}
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </Card>
                );
              })}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );

  const renderCity = () => {
    const currentCar = cars.find(c => c.id === selectedCar);
    const currentSkin = currentCar?.skins.find(s => s.id === currentCar.selectedSkin);
    
    return (
      <div className="relative w-full h-screen overflow-hidden bg-gradient-to-b from-[#0a0a1a] via-[#1a0a2e] to-[#0a0a1a]">
        <div className="absolute inset-0" style={{ perspective: '800px' }}>
          {Array.from({ length: 50 }).map((_, i) => {
            const offsetY = ((i * 40 + roadOffset) % 2000) - 500;
            const scale = Math.max(0.2, 1 - offsetY / 2000);
            const opacity = Math.max(0.1, scale);
            
            return (
              <div
                key={i}
                className="absolute left-1/2 -translate-x-1/2"
                style={{
                  bottom: `${offsetY}px`,
                  transform: `translateX(-50%) scale(${scale})`,
                  opacity: opacity,
                  zIndex: Math.floor(scale * 100),
                }}
              >
                <div className="flex gap-4">
                  <div className="w-20 h-32 neon-border-cyan border opacity-30" style={{ backgroundColor: '#1a1a3e' }}></div>
                  <div className="w-[600px] h-2 bg-gray-600"></div>
                  <div className="w-20 h-32 neon-border-magenta border opacity-30" style={{ backgroundColor: '#3e1a1a' }}></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="absolute top-8 left-8 z-20 space-y-4">
          <Card className="p-4 bg-card/90 backdrop-blur border-2 neon-border-cyan">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Icon name="Gauge" className="neon-text-magenta" size={32} />
                <span className="font-orbitron text-3xl neon-text-cyan">{Math.abs(currentSpeed).toFixed(0)} км/ч</span>
              </div>
              {isDrifting && (
                <div className="animate-pulse">
                  <div className="flex items-center gap-2">
                    <Icon name="Zap" className="neon-text-magenta" size={24} />
                    <span className="font-orbitron text-xl neon-text-purple">Дрифт: {currentDriftScore.toFixed(0)}</span>
                  </div>
                  {driftCombo > 1 && (
                    <Badge className="bg-primary font-orbitron">x{driftCombo.toFixed(1)} COMBO!</Badge>
                  )}
                </div>
              )}
              <div className="flex items-center gap-2">
                <Icon name="Coins" className="neon-text-cyan" size={20} />
                <span className="font-orbitron text-lg neon-text-purple">{credits.toLocaleString()} ₽</span>
              </div>
              <div className="text-sm font-roboto neon-text-cyan">
                {currentCar?.name} • {currentSkin?.name}
              </div>
              {isMultiplayer && (
                <div className="text-sm font-roboto neon-text-magenta">
                  <Icon name="Users" size={16} className="inline mr-1" />
                  Игроков: {players.length + 1}
                </div>
              )}
            </div>
          </Card>

          <Button
            onClick={() => setCurrentSection('home')}
            className="neon-border-cyan border-2 font-orbitron"
          >
            <Icon name="Home" className="mr-2" />
            Меню (ESC)
          </Button>
        </div>

        {isMobile && (
          <div className="absolute bottom-8 left-0 right-0 z-20 flex justify-between px-8">
            <div className="flex flex-col gap-4">
              <Button
                onTouchStart={() => setMobileControls(prev => ({ ...prev, gas: true }))}
                onTouchEnd={() => setMobileControls(prev => ({ ...prev, gas: false }))}
                className="w-20 h-20 rounded-full neon-border-cyan border-2 text-2xl font-orbitron"
              >
                ↑
              </Button>
              <Button
                onTouchStart={() => setMobileControls(prev => ({ ...prev, brake: true }))}
                onTouchEnd={() => setMobileControls(prev => ({ ...prev, brake: false }))}
                className="w-20 h-20 rounded-full neon-border-magenta border-2 text-2xl font-orbitron"
              >
                ↓
              </Button>
            </div>
            <div className="flex gap-4">
              <Button
                onTouchStart={() => setMobileControls(prev => ({ ...prev, left: true }))}
                onTouchEnd={() => setMobileControls(prev => ({ ...prev, left: false }))}
                className="w-20 h-20 rounded-full neon-border-cyan border-2 text-2xl font-orbitron"
              >
                ←
              </Button>
              <Button
                onTouchStart={() => setMobileControls(prev => ({ ...prev, right: true }))}
                onTouchEnd={() => setMobileControls(prev => ({ ...prev, right: false }))}
                className="w-20 h-20 rounded-full neon-border-cyan border-2 text-2xl font-orbitron"
              >
                →
              </Button>
            </div>
          </div>
        )}

        {!isMobile && (
          <div className="absolute bottom-8 right-8 z-20">
            <Card className="p-4 bg-card/90 backdrop-blur border-2 neon-border-purple">
              <p className="font-orbitron text-sm neon-text-cyan">Управление:</p>
              <p className="font-roboto text-xs text-muted-foreground">W/↑ - Газ</p>
              <p className="font-roboto text-xs text-muted-foreground">S/↓ - Тормоз</p>
              <p className="font-roboto text-xs text-muted-foreground">A/← D/→ - Поворот</p>
              <p className="font-roboto text-xs text-muted-foreground">Пробел - Ручник</p>
            </Card>
          </div>
        )}

        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 z-10">
          {currentCar && currentSkin && (
            <div style={{ transform: `rotate(${carRotation}deg) scale(1.5)` }}>
              <CarModel3D car={currentCar} skin={currentSkin} />
            </div>
          )}
        </div>

        {players.map((player) => {
          const playerCar = cars.find(c => c.id === player.car);
          const playerSkin = playerCar?.skins.find(s => s.id === player.skin);
          
          return playerCar && playerSkin ? (
            <div
              key={player.id}
              className="absolute z-5"
              style={{
                left: `${player.position.x}%`,
                top: `${player.position.y}%`,
                transform: `rotate(${player.rotation}deg) scale(0.8)`,
                opacity: 0.7,
              }}
            >
              <CarModel3D car={playerCar} skin={playerSkin} />
              <div className="text-xs font-orbitron neon-text-cyan text-center">{player.name}</div>
            </div>
          ) : null;
        })}
      </div>
    );
  };

  const renderMultiplayer = () => (
    <div className="min-h-screen p-4 md:p-8">
      <Button
        onClick={() => {
          setCurrentSection('home');
          playSound('button');
        }}
        className="mb-6 neon-border-cyan border-2 font-orbitron"
      >
        <Icon name="ArrowLeft" className="mr-2" />
        Назад
      </Button>

      <div className="max-w-2xl mx-auto">
        <h2 className="font-orbitron text-4xl neon-text-cyan mb-8 text-center">МУЛЬТИПЛЕЕР</h2>

        <div className="space-y-6">
          <Card className="p-6 border-2 neon-border-cyan">
            <h3 className="font-orbitron text-2xl neon-text-magenta mb-4">Ваше имя</h3>
            <Input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Введите имя"
              className="font-orbitron neon-border-cyan border-2 text-lg"
              maxLength={20}
            />
          </Card>

          <Card className="p-6 border-2 neon-border-magenta">
            <h3 className="font-orbitron text-2xl neon-text-cyan mb-4">Создать комнату</h3>
            <Button
              onClick={createRoom}
              className="w-full h-16 text-xl font-orbitron neon-border-cyan border-2"
            >
              <Icon name="Plus" className="mr-2" size={24} />
              Создать сервер (5 игроков)
            </Button>
          </Card>

          <Card className="p-6 border-2 neon-border-purple">
            <h3 className="font-orbitron text-2xl neon-text-magenta mb-4">Присоединиться</h3>
            <div className="space-y-4">
              <Input
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="КОД КОМНАТЫ"
                className="font-orbitron neon-border-magenta border-2 text-2xl text-center uppercase"
                maxLength={6}
              />
              <Button
                onClick={() => joinRoom(roomCode)}
                disabled={roomCode.length !== 6}
                className="w-full h-16 text-xl font-orbitron neon-border-cyan border-2"
              >
                <Icon name="LogIn" className="mr-2" size={24} />
                Войти в комнату
              </Button>
            </div>
          </Card>

          {isMultiplayer && roomCode && (
            <Card className="p-6 border-2 neon-border-cyan animate-neon-pulse">
              <div className="text-center space-y-4">
                <h3 className="font-orbitron text-2xl neon-text-cyan">КОМНАТА АКТИВНА</h3>
                <div className="text-4xl font-orbitron neon-text-magenta">{roomCode}</div>
                <p className="font-roboto text-sm text-muted-foreground">
                  Игроков в комнате: {players.length + 1}/5
                </p>
                <Button
                  onClick={() => {
                    setIsMultiplayer(false);
                    setRoomCode('');
                    setPlayers([]);
                  }}
                  variant="destructive"
                  className="w-full font-orbitron"
                >
                  <Icon name="X" className="mr-2" />
                  Покинуть комнату
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );

  const renderLeaderboard = () => (
    <div className="min-h-screen p-4 md:p-8">
      <Button
        onClick={() => {
          setCurrentSection('home');
          playSound('button');
        }}
        className="mb-6 neon-border-cyan border-2 font-orbitron"
      >
        <Icon name="ArrowLeft" className="mr-2" />
        Назад
      </Button>

      <div className="max-w-4xl mx-auto">
        <h2 className="font-orbitron text-4xl neon-text-cyan mb-8 text-center">ЛИДЕРБОРД</h2>

        <div className="space-y-4">
          {leaderboard.map((entry) => (
            <Card
              key={entry.rank}
              className={`p-6 border-2 transition-all hover:scale-105 ${
                entry.rank === 1
                  ? 'neon-border-magenta bg-gradient-to-r from-card to-secondary/20'
                  : entry.rank <= 3
                  ? 'neon-border-cyan'
                  : 'border-muted'
              }`}
            >
              <div className="flex items-center gap-6">
                <div className="flex-shrink-0">
                  {entry.rank === 1 && <Icon name="Crown" size={48} className="neon-text-magenta" />}
                  {entry.rank === 2 && <Icon name="Trophy" size={48} className="neon-text-cyan" />}
                  {entry.rank === 3 && <Icon name="Award" size={48} className="neon-text-purple" />}
                  {entry.rank > 3 && (
                    <div className="w-12 h-12 flex items-center justify-center">
                      <span className="font-orbitron text-2xl text-muted-foreground">{entry.rank}</span>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-orbitron text-xl neon-text-purple">{entry.name}</h3>
                  <p className="font-roboto text-sm text-muted-foreground">{entry.car}</p>
                </div>
                <div className="text-right">
                  <p className="font-orbitron text-2xl neon-text-cyan">{entry.score.toLocaleString()}</p>
                  <p className="font-roboto text-xs text-muted-foreground">очков</p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="mt-8 p-6 border-2 neon-border-purple">
          <div className="text-center">
            <h3 className="font-orbitron text-xl neon-text-cyan mb-2">Ваша статистика</h3>
            <div className="grid grid-cols-3 gap-4 mt-4">
              <div>
                <p className="font-orbitron text-2xl neon-text-magenta">{credits.toLocaleString()}</p>
                <p className="font-roboto text-xs text-muted-foreground">Рублей</p>
              </div>
              <div>
                <p className="font-orbitron text-2xl neon-text-cyan">{totalDrifts}</p>
                <p className="font-roboto text-xs text-muted-foreground">Дрифтов</p>
              </div>
              <div>
                <p className="font-orbitron text-2xl neon-text-purple">{totalDistance.toFixed(1)} км</p>
                <p className="font-roboto text-xs text-muted-foreground">Пробег</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderAchievements = () => (
    <div className="min-h-screen p-4 md:p-8">
      <Button
        onClick={() => {
          setCurrentSection('home');
          playSound('button');
        }}
        className="mb-6 neon-border-cyan border-2 font-orbitron"
      >
        <Icon name="ArrowLeft" className="mr-2" />
        Назад
      </Button>

      <div className="max-w-4xl mx-auto">
        <h2 className="font-orbitron text-4xl neon-text-cyan mb-8 text-center">ДОСТИЖЕНИЯ</h2>

        <div className="mb-6 text-center">
          <p className="font-orbitron text-xl neon-text-magenta">
            {achievements.filter(a => a.completed).length} / {achievements.length}
          </p>
          <Progress 
            value={(achievements.filter(a => a.completed).length / achievements.length) * 100} 
            className="h-4 mt-2"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`p-6 border-2 transition-all ${
                achievement.completed
                  ? 'neon-border-cyan'
                  : 'border-muted opacity-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <Icon
                  name={achievement.icon as any}
                  size={48}
                  className={achievement.completed ? 'neon-text-magenta' : 'text-muted-foreground'}
                />
                <div className="flex-1">
                  <h3 className="font-orbitron text-xl neon-text-purple mb-2">{achievement.title}</h3>
                  <p className="font-roboto text-sm text-muted-foreground">{achievement.description}</p>
                  {achievement.completed && (
                    <Badge className="mt-3 bg-primary font-orbitron">✓ Получено</Badge>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="min-h-screen p-4 md:p-8">
      <Button
        onClick={() => {
          setCurrentSection('home');
          playSound('button');
        }}
        className="mb-6 neon-border-cyan border-2 font-orbitron"
      >
        <Icon name="ArrowLeft" className="mr-2" />
        Назад
      </Button>

      <div className="max-w-2xl mx-auto">
        <h2 className="font-orbitron text-4xl neon-text-cyan mb-8 text-center">НАСТРОЙКИ</h2>

        <div className="space-y-6">
          <Card className="p-6 border-2 neon-border-cyan">
            <h3 className="font-orbitron text-xl neon-text-magenta mb-4">Звук</h3>
            <div className="space-y-4">
              <div>
                <label className="font-roboto text-sm neon-text-cyan mb-2 block">
                  Музыка: {settings.music}%
                </label>
                <Slider
                  value={[settings.music]}
                  onValueChange={([value]) => setSettings({ ...settings, music: value })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              <div>
                <label className="font-roboto text-sm neon-text-cyan mb-2 block">
                  Эффекты: {settings.sfx}%
                </label>
                <Slider
                  value={[settings.sfx]}
                  onValueChange={([value]) => setSettings({ ...settings, sfx: value })}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
            </div>
          </Card>

          <Card className="p-6 border-2 neon-border-magenta">
            <h3 className="font-orbitron text-xl neon-text-cyan mb-4">Управление</h3>
            <div>
              <label className="font-roboto text-sm neon-text-cyan mb-2 block">
                Чувствительность: {settings.sensitivity}%
              </label>
              <Slider
                value={[settings.sensitivity]}
                onValueChange={([value]) => setSettings({ ...settings, sensitivity: value })}
                max={100}
                step={1}
                className="w-full"
              />
            </div>
          </Card>

          <Card className="p-6 border-2 neon-border-purple">
            <h3 className="font-orbitron text-xl neon-text-magenta mb-4">Прогресс</h3>
            <div className="space-y-3">
              <div className="flex justify-between font-roboto text-sm">
                <span className="neon-text-cyan">Рублей заработано:</span>
                <span className="neon-text-purple">{totalEarnings.toLocaleString()}</span>
              </div>
              <div className="flex justify-between font-roboto text-sm">
                <span className="neon-text-cyan">Машин куплено:</span>
                <span className="neon-text-purple">{cars.filter(c => c.unlocked).length}/{cars.length}</span>
              </div>
              <div className="flex justify-between font-roboto text-sm">
                <span className="neon-text-cyan">Достижений:</span>
                <span className="neon-text-purple">{achievements.filter(a => a.completed).length}/{achievements.length}</span>
              </div>
              <div className="flex justify-between font-roboto text-sm">
                <span className="neon-text-cyan">Дрифтов:</span>
                <span className="neon-text-purple">{totalDrifts}</span>
              </div>
              <div className="flex justify-between font-roboto text-sm">
                <span className="neon-text-cyan">Пробег:</span>
                <span className="neon-text-purple">{totalDistance.toFixed(1)} км</span>
              </div>
              <Button
                onClick={resetProgress}
                variant="destructive"
                className="w-full mt-4 font-orbitron"
              >
                <Icon name="Trash2" className="mr-2" />
                Сбросить весь прогресс
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background font-roboto">
      {currentSection === 'home' && renderHome()}
      {currentSection === 'garage' && renderGarage()}
      {currentSection === 'city' && renderCity()}
      {currentSection === 'multiplayer' && renderMultiplayer()}
      {currentSection === 'leaderboard' && renderLeaderboard()}
      {currentSection === 'achievements' && renderAchievements()}
      {currentSection === 'settings' && renderSettings()}
      {currentSection === 'admin' && isAdmin && renderAdmin()}
      {currentSection === 'tasks' && renderTasks()}
    </div>
  );
};

export default Index;