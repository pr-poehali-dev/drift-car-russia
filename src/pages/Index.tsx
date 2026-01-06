import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';

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
  },
];

const INITIAL_ACHIEVEMENTS: Achievement[] = [
  { id: '1', title: 'Первый дрифт', description: 'Выполните свой первый дрифт', completed: false, icon: 'Zap' },
  { id: '2', title: 'Коллекционер', description: 'Разблокируйте все автомобили', completed: false, icon: 'Trophy' },
  { id: '3', title: 'Король дрифта', description: 'Наберите 10000 очков за один дрифт', completed: false, icon: 'Crown' },
  { id: '4', title: 'Тюнер', description: 'Максимально улучшите любой автомобиль', completed: false, icon: 'Wrench' },
  { id: '5', title: 'Легенда', description: 'Займите 1 место в лидерборде', completed: false, icon: 'Star' },
  { id: '6', title: 'Скорость света', description: 'Разгонитесь до 235 км/ч', completed: false, icon: 'Rocket' },
  { id: '7', title: 'Миллионер', description: 'Заработайте 50000 рублей', completed: false, icon: 'BadgeDollarSign' },
];

const Index = () => {
  const { toast } = useToast();
  const [currentSection, setCurrentSection] = useState<'home' | 'garage' | 'city' | 'leaderboard' | 'achievements' | 'settings'>('city');
  const [selectedCar, setSelectedCar] = useState<string>('lada');
  const [credits, setCredits] = useState(5000);
  const [totalEarnings, setTotalEarnings] = useState(0);
  const [currentSpeed, setCurrentSpeed] = useState(0);
  const [currentDriftScore, setCurrentDriftScore] = useState(0);
  const [driftCombo, setDriftCombo] = useState(0);
  const [isDrifting, setIsDrifting] = useState(false);
  const [carPosition, setCarPosition] = useState({ x: 50, y: 50, z: 0 });
  const [carRotation, setCarRotation] = useState(0);
  const [roadOffset, setRoadOffset] = useState(0);
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

  const [leaderboard] = useState<LeaderboardEntry[]>([
    { rank: 1, name: 'DRIFT_KING_77', score: 25680, car: 'ВАЗ 2114' },
    { rank: 2, name: 'NeonRacer', score: 23450, car: 'Жигули 2106' },
    { rank: 3, name: 'CyberDriver', score: 21230, car: 'Lada Niva' },
    { rank: 4, name: 'RussianDrift', score: 19880, car: 'Lada 2107' },
    { rank: 5, name: 'MoscowNights', score: 18560, car: 'ВАЗ 2114' },
  ]);

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
    };
    localStorage.setItem('driftCarRussiaState', JSON.stringify(stateToSave));
  }, [cars, credits, selectedCar, settings, achievements]);

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

    if (keysPressed.current.has('w') || keysPressed.current.has('arrowup')) {
      targetSpeed = maxSpeedKmh;
    }
    if (keysPressed.current.has('s') || keysPressed.current.has('arrowdown')) {
      targetSpeed = -maxSpeedKmh * 0.5;
    }

    const speedDiff = targetSpeed - currentSpeed;
    const newSpeed = currentSpeed + Math.sign(speedDiff) * Math.min(Math.abs(speedDiff), acceleration);
    setCurrentSpeed(newSpeed);

    if (keysPressed.current.has('a') || keysPressed.current.has('arrowleft')) {
      const turnSpeed = handling * (Math.abs(currentSpeed) / maxSpeedKmh);
      newRotation -= turnSpeed;
      if (Math.abs(currentSpeed) > maxSpeedKmh * 0.3) {
        isDriftingNow = true;
      }
    }
    if (keysPressed.current.has('d') || keysPressed.current.has('arrowright')) {
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
      const driftPoints = Math.floor(Math.abs(currentSpeed) / 10) * (1 + driftCombo * 0.1);
      setCurrentDriftScore(prev => prev + driftPoints);
      setDriftCombo(prev => Math.min(prev + 1, 10));
      
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

    if (Math.abs(currentSpeed) >= maxSpeedKmh * 0.99 && maxSpeedKmh >= 235) {
      unlockAchievement('6');
    }

    if (totalEarnings >= 50000) {
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
  }, [currentSection, currentSpeed, carRotation, selectedCar, isDrifting, currentDriftScore, driftCombo]);

  const upgradeCar = (carId: string, stat: 'speed' | 'handling' | 'acceleration') => {
    const car = cars.find(c => c.id === carId);
    if (!car) return;

    const upgradeCost = 500;
    const maxValue = stat === 'speed' ? car.maxSpeed : stat === 'handling' ? car.maxHandling : car.maxAcceleration;
    const currentValue = car[stat];

    if (credits >= upgradeCost && currentValue < maxValue) {
      setCars(cars.map(c => 
        c.id === carId 
          ? { ...c, [stat]: Math.min(currentValue + 10, maxValue) }
          : c
      ));
      setCredits(credits - upgradeCost);
      playSound('upgrade');

      const updatedCars = cars.map(c => 
        c.id === carId 
          ? { ...c, [stat]: Math.min(currentValue + 10, maxValue) }
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

      if (cars.filter(c => c.unlocked).length + 1 === cars.length) {
        unlockAchievement('2');
      }
    }
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

  const renderHome = () => (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <div className="text-center space-y-8 max-w-4xl">
        <h1 className="font-orbitron text-8xl font-black neon-text-cyan tracking-wider animate-glitch">
          DRIFT CAR RUSSIA
        </h1>
        <p className="font-roboto text-2xl neon-text-magenta">
          Открытый мир • Киберпанк • Неоновые ночи
        </p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-12">
          {['city', 'garage', 'leaderboard', 'achievements', 'settings'].map((section) => {
            const icons = {
              garage: 'Car',
              city: 'Gamepad2',
              leaderboard: 'Trophy',
              achievements: 'Award',
              settings: 'Settings',
            };
            const labels = {
              garage: 'Гараж',
              city: 'Открытый мир',
              leaderboard: 'Лидерборд',
              achievements: 'Достижения',
              settings: 'Настройки',
            };
            return (
              <Button
                key={section}
                onClick={() => {
                  setCurrentSection(section as any);
                  playSound('button');
                }}
                className="h-24 text-xl font-orbitron bg-card hover:bg-card/80 neon-border-cyan border-2 transition-all hover:scale-105"
              >
                <div className="flex flex-col items-center gap-2">
                  <Icon name={icons[section as keyof typeof icons] as any} size={32} className="neon-text-cyan" />
                  <span className="neon-text-purple">{labels[section as keyof typeof labels]}</span>
                </div>
              </Button>
            );
          })}
        </div>
        <div className="mt-8 flex items-center justify-center gap-4">
          <Icon name="Coins" className="neon-text-magenta" size={32} />
          <span className="font-orbitron text-3xl neon-text-cyan">{credits} ₽</span>
        </div>
      </div>
    </div>
  );

  const renderGarage = () => {
    const car = cars.find(c => c.id === selectedCar);
    if (!car) return null;

    return (
      <div className="min-h-screen p-8">
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
        
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <h2 className="font-orbitron text-4xl neon-text-cyan">ГАРАЖ</h2>
            <div className="space-y-3">
              {cars.map((c) => (
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
                        <h3 className="font-orbitron text-xl neon-text-purple">{c.name}</h3>
                        {!c.unlocked && (
                          <p className="text-sm text-muted-foreground">
                            Цена: {c.price} ₽
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
                      >
                        Купить
                      </Button>
                    ) : (
                      <Badge className="bg-primary font-orbitron">Куплено</Badge>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {car.unlocked && (
            <div className="space-y-6">
              <Card className="p-6 border-2 neon-border-cyan">
                <h3 className="font-orbitron text-2xl neon-text-magenta mb-6">{car.name}</h3>
                
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-roboto neon-text-purple">Макс. скорость</span>
                      <span className="font-orbitron neon-text-cyan">{car.speed}/{car.maxSpeed} км/ч</span>
                    </div>
                    <Progress value={(car.speed / car.maxSpeed) * 100} className="h-2" />
                    <Button
                      onClick={() => upgradeCar(car.id, 'speed')}
                      disabled={car.speed >= car.maxSpeed || credits < 500}
                      className="mt-2 w-full neon-border-magenta border font-orbitron"
                      size="sm"
                    >
                      Улучшить +10 км/ч (500₽)
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
                      disabled={car.handling >= car.maxHandling || credits < 500}
                      className="mt-2 w-full neon-border-magenta border font-orbitron"
                      size="sm"
                    >
                      Улучшить (500₽)
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
                      disabled={car.acceleration >= car.maxAcceleration || credits < 500}
                      className="mt-2 w-full neon-border-magenta border font-orbitron"
                      size="sm"
                    >
                      Улучшить (500₽)
                    </Button>
                  </div>
                </div>
              </Card>

              <div className="text-center">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <Icon name="Coins" className="neon-text-magenta" size={32} />
                  <span className="font-orbitron text-3xl neon-text-cyan">{credits} ₽</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderCity = () => {
    const car = cars.find(c => c.id === selectedCar);
    
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
          </div>
        </div>

        <div className="absolute top-4 left-4 right-4 flex justify-between items-start z-10">
          <Button
            onClick={() => {
              setCurrentSection('home');
              playSound('button');
            }}
            className="neon-border-cyan border-2 font-orbitron"
            size="sm"
          >
            <Icon name="Menu" className="mr-2" size={16} />
            ESC - Меню
          </Button>

          <Card className="p-4 bg-background/80 backdrop-blur border-2 neon-border-cyan">
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="font-orbitron text-3xl neon-text-cyan">{Math.abs(currentSpeed).toFixed(0)}</div>
                <div className="font-roboto text-xs neon-text-purple">км/ч</div>
              </div>
              <div className="text-center">
                <div className="font-orbitron text-2xl neon-text-magenta">{credits}</div>
                <div className="font-roboto text-xs neon-text-purple">рублей</div>
              </div>
            </div>
          </Card>
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-10 space-y-4">
          {isDrifting && (
            <Card className="p-6 bg-background/90 backdrop-blur border-2 neon-border-magenta animate-pulse">
              <div className="text-center space-y-2">
                <div className="font-orbitron text-5xl neon-text-cyan">
                  {currentDriftScore.toFixed(0)}
                </div>
                <div className="font-roboto text-lg neon-text-magenta">
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

          <Card className="p-4 bg-background/80 backdrop-blur border-2 neon-border-cyan">
            <div className="font-roboto text-sm neon-text-purple text-center space-y-1">
              <div className="flex justify-center gap-8">
                <span>W/↑ - Газ</span>
                <span>A/← D/→ - Поворот</span>
                <span>S/↓ - Назад</span>
                <span>SPACE - Тормоз</span>
              </div>
              <div className="font-orbitron text-xs neon-text-magenta">
                {car?.name} • Награды: 1000 очков = 500₽ | 2000 = 1000₽ | 3000 = 3000₽
              </div>
            </div>
          </Card>
        </div>

        <div className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 z-5">
          <Icon name="Car" size={80} className="neon-text-magenta" style={{ transform: `rotate(${carRotation}deg)` }} />
        </div>
      </div>
    );
  };

  const renderLeaderboard = () => (
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

      <div className="max-w-4xl mx-auto">
        <h2 className="font-orbitron text-4xl neon-text-cyan mb-8 text-center">ЛИДЕРБОРД</h2>
        
        <div className="space-y-3">
          {leaderboard.map((entry) => (
            <Card
              key={entry.rank}
              className={`p-6 border-2 transition-all ${
                entry.rank <= 3 
                  ? 'neon-border-cyan animate-neon-pulse' 
                  : 'border-muted hover:border-primary'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className={`font-orbitron text-4xl ${
                    entry.rank === 1 ? 'neon-text-cyan' :
                    entry.rank === 2 ? 'neon-text-magenta' :
                    entry.rank === 3 ? 'neon-text-purple' :
                    'text-muted-foreground'
                  }`}>
                    #{entry.rank}
                  </div>
                  <div>
                    <h3 className="font-orbitron text-xl neon-text-purple">{entry.name}</h3>
                    <p className="font-roboto text-sm text-muted-foreground">{entry.car}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-orbitron text-2xl neon-text-cyan">{entry.score.toLocaleString()}</div>
                  <div className="font-roboto text-sm neon-text-magenta">очков</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAchievements = () => (
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

      <div className="max-w-4xl mx-auto">
        <h2 className="font-orbitron text-4xl neon-text-cyan mb-8 text-center">ДОСТИЖЕНИЯ</h2>
        
        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map((achievement) => (
            <Card
              key={achievement.id}
              className={`p-6 border-2 transition-all ${
                achievement.completed 
                  ? 'neon-border-cyan' 
                  : 'border-muted opacity-60'
              }`}
            >
              <div className="flex items-start gap-4">
                <Icon 
                  name={achievement.icon as any} 
                  size={48} 
                  className={achievement.completed ? 'neon-text-magenta' : 'text-muted-foreground'} 
                />
                <div className="flex-1">
                  <h3 className="font-orbitron text-xl neon-text-purple mb-1">
                    {achievement.title}
                  </h3>
                  <p className="font-roboto text-sm text-muted-foreground">
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

      <div className="max-w-2xl mx-auto">
        <h2 className="font-orbitron text-4xl neon-text-cyan mb-8 text-center">НАСТРОЙКИ</h2>
        
        <Card className="p-8 border-2 neon-border-cyan space-y-8">
          <div>
            <div className="flex justify-between mb-4">
              <span className="font-roboto text-lg neon-text-purple">Музыка</span>
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
              <span className="font-roboto text-lg neon-text-purple">Звуковые эффекты</span>
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
              <span className="font-roboto text-lg neon-text-purple">Чувствительность управления</span>
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
              <div>Заработано всего: {totalEarnings}₽</div>
              <div>Машин разблокировано: {cars.filter(c => c.unlocked).length}/{cars.length}</div>
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
      {currentSection === 'leaderboard' && renderLeaderboard()}
      {currentSection === 'achievements' && renderAchievements()}
      {currentSection === 'settings' && renderSettings()}
    </div>
  );
};

export default Index;
