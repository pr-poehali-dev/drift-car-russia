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
};

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
];

const Index = () => {
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState<'home' | 'garage' | 'city' | 'leaderboard' | 'achievements' | 'settings' | 'multiplayer'>('city');
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
    };
    localStorage.setItem('driftCarRussiaState', JSON.stringify(stateToSave));
  }, [cars, credits, selectedCar, settings, achievements, playerName]);

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

    if (isDriftingNow && Math.abs(currentSpeed) > 0) {
      const driftPoints = Math.floor(Math.abs(currentSpeed) / 5) * (1 + driftCombo * 0.15);
      setCurrentDriftScore(prev => prev + driftPoints);
      setDriftCombo(prev => Math.min(prev + 1, 20));
      
      if (!isDrifting) {
        setIsDrifting(true);
        playSound('drift');
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
          setTotalEarnings(prev => prev + reward);
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
  }, [currentSection, currentSpeed, carRotation, selectedCar, isDrifting, currentDriftScore, driftCombo, mobileControls]);

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
          {['city', 'multiplayer', 'garage', 'leaderboard', 'achievements', 'settings'].map((section) => {
            const icons = {
              garage: 'Car',
              city: 'Gamepad2',
              leaderboard: 'Trophy',
              achievements: 'Award',
              settings: 'Settings',
              multiplayer: 'Users',
            };
            const labels = {
              garage: 'Гараж',
              city: 'Открытый мир',
              leaderboard: 'Лидерборд',
              achievements: 'Достижения',
              settings: 'Настройки',
              multiplayer: 'Мультиплеер',
            };
            return (
              <Button
                key={section}
                onClick={() => {
                  setCurrentSection(section as any);
                  playSound('button');
                }}
                className="h-24 text-lg md:text-xl font-orbitron bg-card hover:bg-card/80 neon-border-cyan border-2 transition-all hover:scale-105"
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon name={icons[section as keyof typeof icons] as any} size={32} className="neon-text-cyan" />
                  <span className="neon-text-purple text-sm md:text-base">{labels[section as keyof typeof labels]}</span>
                </div>
              </Button>
            );
          })}
        </div>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Icon name="Coins" className="neon-text-magenta" size={32} />
          <span className="font-orbitron text-2xl md:text-3xl neon-text-cyan">{credits} ₽</span>
        </div>
      </div>
    </div>
  );

  const renderGarage = () => {
    const car = cars.find(c => c.id === selectedCar);
    if (!car) return null;

    const russianCars = cars.filter(c => c.category === 'russian');
    const premiumCars = cars.filter(c => c.category === 'premium');

    return (
      <div className="min-h-screen p-4 md:p-8">
        <Button
          onClick={() => {
            setCurrentSection('home');
            playSound('button');
          }}
          className="mb-6 neon-border-cyan border-2 font-orbitron"
        >
          <Icon name="ArrowLeft" className="mr-2" />
          Меню
        </Button>
        
        <Tabs defaultValue="cars" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="cars" className="font-orbitron">Машины</TabsTrigger>
            <TabsTrigger value="skins" className="font-orbitron">Скины</TabsTrigger>
          </TabsList>

          <TabsContent value="cars">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div>
                  <h2 className="font-orbitron text-2xl md:text-4xl neon-text-cyan mb-4">РОССИЙСКИЕ АВТО</h2>
                  <div className="space-y-3">
                    {russianCars.map((c) => (
                      <Card
                        key={c.id}
                        className={`p-4 cursor-pointer transition-all border-2 ${
                          selectedCar === c.id 
                            ? 'neon-border-cyan scale-105' 
                            : 'border-muted hover:border-primary'
                        } ${!c.unlocked ? 'opacity-50' : ''}`}
                        onClick={() => {
                          if (c.unlocked) {
                            setSelectedCar(c.id);
                            playSound('button');
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Icon name="Car" size={32} className="neon-text-magenta" />
                            <div>
                              <h3 className="font-orbitron text-lg neon-text-purple">{c.name}</h3>
                              {!c.unlocked && (
                                <p className="text-sm text-muted-foreground">
                                  {c.price} ₽
                                </p>
                              )}
                            </div>
                          </div>
                          {!c.unlocked ? (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                unlockCar(c.id);
                              }}
                              disabled={credits < c.price}
                              className="neon-border-magenta border-2 font-orbitron"
                              size="sm"
                            >
                              Купить
                            </Button>
                          ) : (
                            <Badge className="bg-primary font-orbitron">✓</Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="font-orbitron text-2xl md:text-4xl neon-text-magenta mb-4">ПРЕМИУМ КЛАСС</h2>
                  <div className="space-y-3">
                    {premiumCars.map((c) => (
                      <Card
                        key={c.id}
                        className={`p-4 cursor-pointer transition-all border-2 ${
                          selectedCar === c.id 
                            ? 'neon-border-magenta scale-105' 
                            : 'border-muted hover:border-secondary'
                        } ${!c.unlocked ? 'opacity-50' : ''}`}
                        onClick={() => {
                          if (c.unlocked) {
                            setSelectedCar(c.id);
                            playSound('button');
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Icon name="Gem" size={32} className="neon-text-cyan" />
                            <div>
                              <h3 className="font-orbitron text-lg neon-text-cyan">{c.name}</h3>
                              {!c.unlocked && (
                                <p className="text-sm neon-text-magenta">
                                  {c.price.toLocaleString()} ₽
                                </p>
                              )}
                            </div>
                          </div>
                          {!c.unlocked ? (
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                unlockCar(c.id);
                              }}
                              disabled={credits < c.price}
                              className="neon-border-cyan border-2 font-orbitron"
                              size="sm"
                            >
                              Купить
                            </Button>
                          ) : (
                            <Badge className="bg-secondary font-orbitron">✓</Badge>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {car.unlocked && (
                <div className="space-y-6">
                  <Card className="p-6 border-2 neon-border-cyan">
                    <h3 className="font-orbitron text-xl md:text-2xl neon-text-magenta mb-6">{car.name}</h3>
                    
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-roboto neon-text-purple">Макс. скорость</span>
                          <span className="font-orbitron neon-text-cyan">{car.speed}/{car.maxSpeed} км/ч</span>
                        </div>
                        <Progress value={(car.speed / car.maxSpeed) * 100} className="h-2" />
                        <Button
                          onClick={() => upgradeCar(car.id, 'speed')}
                          disabled={car.speed >= car.maxSpeed || credits < (car.category === 'premium' ? 5000 : 500)}
                          className="mt-2 w-full neon-border-magenta border font-orbitron"
                          size="sm"
                        >
                          Улучшить +{car.category === 'premium' ? 20 : 10} ({car.category === 'premium' ? 5000 : 500}₽)
                        </Button>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-roboto neon-text-purple">Управляемость</span>
                          <span className="font-orbitron neon-text-cyan">{car.handling}/{car.maxHandling}</span>
                        </div>
                        <Progress value={car.handling} className="h-2" />
                        <Button
                          onClick={() => upgradeCar(car.id, 'handling')}
                          disabled={car.handling >= car.maxHandling || credits < (car.category === 'premium' ? 5000 : 500)}
                          className="mt-2 w-full neon-border-magenta border font-orbitron"
                          size="sm"
                        >
                          Улучшить ({car.category === 'premium' ? 5000 : 500}₽)
                        </Button>
                      </div>

                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="font-roboto neon-text-purple">Ускорение</span>
                          <span className="font-orbitron neon-text-cyan">{car.acceleration}/{car.maxAcceleration}</span>
                        </div>
                        <Progress value={car.acceleration} className="h-2" />
                        <Button
                          onClick={() => upgradeCar(car.id, 'acceleration')}
                          disabled={car.acceleration >= car.maxAcceleration || credits < (car.category === 'premium' ? 5000 : 500)}
                          className="mt-2 w-full neon-border-magenta border font-orbitron"
                          size="sm"
                        >
                          Улучшить ({car.category === 'premium' ? 5000 : 500}₽)
                        </Button>
                      </div>
                    </div>
                  </Card>

                  <div className="text-center">
                    <div className="flex items-center justify-center gap-4">
                      <Icon name="Coins" className="neon-text-magenta" size={32} />
                      <span className="font-orbitron text-2xl md:text-3xl neon-text-cyan">{credits} ₽</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="skins">
            <div className="max-w-4xl mx-auto">
              <h2 className="font-orbitron text-3xl neon-text-cyan mb-6 text-center">ВЫБЕРИ СКИН ДЛЯ {car.name.toUpperCase()}</h2>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {car.skins.map((skin) => (
                  <Card
                    key={skin.id}
                    className={`p-6 cursor-pointer transition-all border-2 ${
                      car.selectedSkin === skin.id 
                        ? 'neon-border-cyan scale-105' 
                        : skin.unlocked 
                        ? 'border-muted hover:border-primary' 
                        : 'opacity-50 border-muted'
                    }`}
                    onClick={() => {
                      if (skin.unlocked) {
                        selectSkin(car.id, skin.id);
                      }
                    }}
                  >
                    <div className="space-y-4">
                      <div
                        className="w-full h-24 rounded border-2"
                        style={{ 
                          background: skin.color.includes('gradient') ? skin.color : skin.color,
                          borderColor: 'hsl(var(--primary))',
                          boxShadow: `0 0 20px ${skin.color}`,
                        }}
                      />
                      <div className="text-center">
                        <h3 className="font-orbitron neon-text-purple mb-2">{skin.name}</h3>
                        {!skin.unlocked ? (
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              unlockSkin(car.id, skin.id);
                            }}
                            disabled={credits < skin.price}
                            className="w-full neon-border-magenta border font-orbitron"
                            size="sm"
                          >
                            {skin.price}₽
                          </Button>
                        ) : car.selectedSkin === skin.id ? (
                          <Badge className="w-full bg-primary font-orbitron">Выбран</Badge>
                        ) : (
                          <Badge className="w-full bg-muted font-orbitron">Куплен</Badge>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  };

  const renderMultiplayer = () => (
    <div className="min-h-screen p-8">
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

      <div className="max-w-2xl mx-auto space-y-8">
        <h2 className="font-orbitron text-4xl neon-text-cyan text-center">МУЛЬТИПЛЕЕР</h2>
        
        <Card className="p-8 border-2 neon-border-cyan space-y-6">
          <div className="space-y-4">
            <div>
              <label className="font-roboto text-lg neon-text-purple mb-2 block">Ваше имя</label>
              <Input
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder="Введите имя"
                className="font-orbitron neon-border-cyan border-2"
                maxLength={20}
              />
            </div>

            <div className="pt-4 border-t border-primary">
              <h3 className="font-orbitron text-xl neon-text-magenta mb-4">Создать комнату</h3>
              <Button
                onClick={createRoom}
                className="w-full h-16 text-xl font-orbitron neon-border-cyan border-2"
              >
                <Icon name="Plus" className="mr-2" size={24} />
                Создать сервер (до 5 игроков)
              </Button>
            </div>

            <div className="pt-4 border-t border-primary">
              <h3 className="font-orbitron text-xl neon-text-magenta mb-4">Присоединиться</h3>
              <div className="flex gap-2">
                <Input
                  placeholder="КОД КОМНАТЫ"
                  className="font-orbitron neon-border-magenta border-2 uppercase"
                  maxLength={6}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                />
                <Button
                  onClick={() => joinRoom(roomCode)}
                  disabled={roomCode.length !== 6}
                  className="neon-border-magenta border-2 font-orbitron"
                >
                  <Icon name="LogIn" size={20} />
                </Button>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-primary">
            <div className="font-roboto text-sm neon-text-purple space-y-2">
              <p>• Комната хранится локально</p>
              <p>• Максимум 5 игроков на сервер</p>
              <p>• Делитесь кодом с друзьями</p>
              <p>• Соревнуйтесь в дрифте!</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderCity = () => {
    const car = cars.find(c => c.id === selectedCar);
    const currentSkin = car?.skins.find(s => s.id === car.selectedSkin);
    
    return (
      <div className="fixed inset-0 bg-background overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/10 to-secondary/20">
          <div className="absolute inset-0" style={{ perspective: '400px' }}>
            {[...Array(50)].map((_, i) => {
              const offset = (roadOffset + i * 20) % 1000;
              const zPos = i * 20;
              const scale = 400 / (400 + zPos);
              const yPos = 50 + (zPos * 0.3);
              
              return (
                <div
                  key={i}
                  className="absolute left-1/2 transform -translate-x-1/2"
                  style={{
                    bottom: `${yPos}%`,
                    width: `${100 * scale}%`,
                    height: '8px',
                    background: i % 2 === 0 ? 'rgba(0, 240, 255, 0.3)' : 'rgba(255, 0, 110, 0.3)',
                    boxShadow: i % 2 === 0 
                      ? '0 0 20px rgba(0, 240, 255, 0.5)'
                      : '0 0 20px rgba(255, 0, 110, 0.5)',
                  }}
                />
              );
            })}

            {[...Array(20)].map((_, i) => {
              const offset = (roadOffset * 2 + i * 100) % 2000;
              const side = i % 2 === 0 ? -30 : 130;
              const zPos = (i * 100) % 1000;
              const scale = 400 / (400 + zPos);
              const yPos = 30 + (zPos * 0.4);
              
              return (
                <div
                  key={`building-${i}`}
                  className="absolute"
                  style={{
                    left: `${side}%`,
                    bottom: `${yPos}%`,
                    width: `${80 * scale}px`,
                    height: `${200 * scale}px`,
                    background: 'linear-gradient(180deg, rgba(155, 135, 245, 0.3) 0%, rgba(0, 240, 255, 0.2) 100%)',
                    border: '2px solid rgba(0, 240, 255, 0.5)',
                    boxShadow: '0 0 30px rgba(0, 240, 255, 0.3)',
                  }}
                />
              );
            })}

            {isMultiplayer && players.map((player) => (
              <div
                key={player.id}
                className="absolute transition-all duration-100"
                style={{
                  left: `${player.position.x}%`,
                  bottom: `${player.position.y}%`,
                  transform: `translate(-50%, -50%) rotate(${player.rotation}deg)`,
                }}
              >
                <div className="flex flex-col items-center">
                  <div className="font-roboto text-xs neon-text-cyan mb-1">{player.name}</div>
                  <Icon name="Car" size={32} className="neon-text-magenta" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="absolute top-2 md:top-4 left-2 md:left-4 right-2 md:right-4 flex justify-between items-start z-10">
          <Button
            onClick={() => {
              setCurrentSection('home');
              setIsMultiplayer(false);
              playSound('button');
            }}
            className="neon-border-cyan border-2 font-orbitron"
            size="sm"
          >
            <Icon name="Menu" className="mr-2" size={16} />
            {!isMobile && 'ESC -'} Меню
          </Button>

          <Card className="p-2 md:p-4 bg-background/80 backdrop-blur border-2 neon-border-cyan">
            <div className="flex items-center gap-2 md:gap-6">
              <div className="text-center">
                <div className="font-orbitron text-xl md:text-3xl neon-text-cyan">{Math.abs(currentSpeed).toFixed(0)}</div>
                <div className="font-roboto text-xs neon-text-purple">км/ч</div>
              </div>
              <div className="text-center">
                <div className="font-orbitron text-lg md:text-2xl neon-text-magenta">{credits}</div>
                <div className="font-roboto text-xs neon-text-purple">₽</div>
              </div>
            </div>
          </Card>
        </div>

        {isMultiplayer && (
          <div className="absolute top-20 right-4 z-10">
            <Card className="p-4 bg-background/90 backdrop-blur border-2 neon-border-cyan max-w-xs">
              <div className="space-y-2">
                <div className="font-orbitron text-sm neon-text-cyan">Игроки: {players.length + 1}/5</div>
                <div className="font-roboto text-xs neon-text-purple">Код: {roomCode}</div>
                {players.slice(0, 4).map((player) => (
                  <div key={player.id} className="text-xs font-roboto neon-text-magenta">
                    {player.name}: {player.score.toFixed(0)} очков
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        <div className="absolute bottom-4 left-4 right-4 z-10 space-y-4">
          {isDrifting && (
            <Card className="p-4 md:p-6 bg-background/90 backdrop-blur border-2 neon-border-magenta animate-pulse">
              <div className="text-center space-y-2">
                <div className="font-orbitron text-3xl md:text-5xl neon-text-cyan">
                  {currentDriftScore.toFixed(0)}
                </div>
                <div className="font-roboto text-base md:text-lg neon-text-magenta">
                  ДРИФТ! x{driftCombo}
                </div>
                <div className="font-roboto text-sm neon-text-purple">
                  {currentDriftScore >= 3000 ? '💰 3000₽' :
                   currentDriftScore >= 2000 ? '💰 1000₽' :
                   currentDriftScore >= 1000 ? '💰 500₽' : 'Продолжай!'}
                </div>
              </div>
            </Card>
          )}

          {!isMobile && (
            <Card className="p-4 bg-background/80 backdrop-blur border-2 neon-border-cyan">
              <div className="font-roboto text-sm neon-text-purple text-center space-y-1">
                <div className="flex justify-center gap-4 md:gap-8 flex-wrap">
                  <span>W/↑ - Газ</span>
                  <span>A/← D/→ - Поворот</span>
                  <span>S/↓ - Назад</span>
                  <span>SPACE - Тормоз</span>
                </div>
                <div className="font-orbitron text-xs neon-text-magenta">
                  {car?.name} • 1000 очков = 500₽ | 2000 = 1000₽ | 3000 = 3000₽
                </div>
              </div>
            </Card>
          )}
        </div>

        {isMobile && (
          <div className="absolute bottom-4 left-4 right-4 z-20 flex justify-between items-end">
            <div className="flex flex-col gap-2">
              <Button
                onTouchStart={() => setMobileControls(prev => ({ ...prev, gas: true }))}
                onTouchEnd={() => setMobileControls(prev => ({ ...prev, gas: false }))}
                className="w-20 h-20 rounded-full neon-border-cyan border-2 font-orbitron text-2xl"
              >
                ↑
              </Button>
              <Button
                onTouchStart={() => setMobileControls(prev => ({ ...prev, brake: true }))}
                onTouchEnd={() => setMobileControls(prev => ({ ...prev, brake: false }))}
                className="w-20 h-20 rounded-full neon-border-magenta border-2 font-orbitron text-2xl"
              >
                ↓
              </Button>
            </div>

            <div className="flex gap-2">
              <Button
                onTouchStart={() => setMobileControls(prev => ({ ...prev, left: true }))}
                onTouchEnd={() => setMobileControls(prev => ({ ...prev, left: false }))}
                className="w-20 h-20 rounded-full neon-border-cyan border-2 font-orbitron text-2xl"
              >
                ←
              </Button>
              <Button
                onTouchStart={() => setMobileControls(prev => ({ ...prev, right: true }))}
                onTouchEnd={() => setMobileControls(prev => ({ ...prev, right: false }))}
                className="w-20 h-20 rounded-full neon-border-cyan border-2 font-orbitron text-2xl"
              >
                →
              </Button>
            </div>
          </div>
        )}

        <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 z-5">
          <div
            style={{
              color: currentSkin?.color,
              filter: `drop-shadow(0 0 20px ${currentSkin?.color})`,
            }}
          >
            <Icon name="Car" size={isMobile ? 60 : 80} style={{ transform: `rotate(${carRotation}deg)` }} />
          </div>
        </div>
      </div>
    );
  };

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
        <h2 className="font-orbitron text-3xl md:text-4xl neon-text-cyan mb-8 text-center">ЛИДЕРБОРД</h2>
        
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <Card
              key={entry.rank}
              className={`p-4 md:p-6 border-2 transition-all ${
                entry.rank <= 3 
                  ? 'neon-border-cyan animate-neon-pulse' 
                  : 'border-muted hover:border-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 md:gap-6">
                  <div className={`font-orbitron text-2xl md:text-4xl ${
                    entry.rank === 1 ? 'neon-text-cyan' :
                    entry.rank === 2 ? 'neon-text-magenta' :
                    entry.rank === 3 ? 'neon-text-purple' :
                    'text-muted-foreground'
                  }`}>
                    #{entry.rank}
                  </div>
                  <div>
                    <h3 className="font-orbitron text-lg md:text-xl neon-text-purple">{entry.name}</h3>
                    <p className="font-roboto text-xs md:text-sm text-muted-foreground">{entry.car}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-orbitron text-xl md:text-2xl neon-text-cyan">{entry.score.toLocaleString()}</div>
                  <div className="font-roboto text-xs md:text-sm neon-text-magenta">очков</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
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
        <h2 className="font-orbitron text-3xl md:text-4xl neon-text-cyan mb-8 text-center">ДОСТИЖЕНИЯ</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`p-4 md:p-6 border-2 transition-all ${
                achievement.completed 
                  ? 'neon-border-cyan' 
                  : 'border-muted opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <Icon 
                  name={achievement.icon as any} 
                  size={isMobile ? 32 : 48} 
                  className={achievement.completed ? 'neon-text-magenta' : 'text-muted-foreground'} 
                />
                <div className="flex-1">
                  <h3 className="font-orbitron text-lg md:text-xl neon-text-purple mb-1">
                    {achievement.title}
                  </h3>
                  <p className="font-roboto text-xs md:text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                  {achievement.completed && (
                    <Badge className="mt-2 bg-primary font-orbitron">Выполнено</Badge>
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
        <h2 className="font-orbitron text-3xl md:text-4xl neon-text-cyan mb-8 text-center">НАСТРОЙКИ</h2>
        
        <Card className="p-6 md:p-8 border-2 neon-border-cyan space-y-8">
          <div>
            <div className="flex justify-between mb-4">
              <span className="font-roboto text-base md:text-lg neon-text-purple">Музыка</span>
              <span className="font-orbitron neon-text-cyan">{settings.music}%</span>
            </div>
            <Slider
              value={[settings.music]}
              onValueChange={(value) => setSettings({ ...settings, music: value[0] })}
              max={100}
              step={1}
            />
          </div>

          <div>
            <div className="flex justify-between mb-4">
              <span className="font-roboto text-base md:text-lg neon-text-purple">Звуковые эффекты</span>
              <span className="font-orbitron neon-text-cyan">{settings.sfx}%</span>
            </div>
            <Slider
              value={[settings.sfx]}
              onValueChange={(value) => setSettings({ ...settings, sfx: value[0] })}
              max={100}
              step={1}
            />
          </div>

          <div>
            <div className="flex justify-between mb-4">
              <span className="font-roboto text-base md:text-lg neon-text-purple">Чувствительность</span>
              <span className="font-orbitron neon-text-cyan">{settings.sensitivity}%</span>
            </div>
            <Slider
              value={[settings.sensitivity]}
              onValueChange={(value) => setSettings({ ...settings, sensitivity: value[0] })}
              max={100}
              step={1}
            />
          </div>

          <div className="pt-6 border-t border-primary space-y-4">
            <div className="text-center font-roboto text-sm neon-text-purple space-y-1">
              <div>Заработано всего: {totalEarnings.toLocaleString()}₽</div>
              <div>Машин: {cars.filter(c => c.unlocked).length}/{cars.length}</div>
              <div>Устройство: {isMobile ? 'Мобильное' : 'ПК'}</div>
            </div>
            <Button 
              onClick={resetProgress}
              className="w-full neon-border-magenta border-2 font-orbitron"
            >
              <Icon name="RotateCcw" className="mr-2" />
              Сбросить прогресс
            </Button>
          </div>
        </Card>
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
    </div>
  );
};

export default Index;
