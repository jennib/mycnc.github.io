import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import Modal from './Modal';
import { X, Calculator, ArrowRightLeft, Ruler } from "@mycnc/shared";
import { decimalToFraction, mmToInches, inchesToMm, fractionToDecimal } from '../utils/mathUtils';
import NumberInput from './ui/NumberInput';
import TextInput from './ui/TextInput';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const [display, setDisplay] = useState('0');
  const [expression, setExpression] = useState('');
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'calculator' | 'converter'>('calculator');

  // Converter state
  const [mmValue, setMmValue] = useState('');
  const [inchValue, setInchValue] = useState('');
  const [fractionValue, setFractionValue] = useState('');

  const handleNumber = (num: string) => {
    if (display === '0' || lastResult !== null) {
      setDisplay(num);
      setLastResult(null);
    } else {
      setDisplay(display + num);
    }
  };

  const handleOperator = (op: string) => {
    setExpression(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const calculate = () => {
    try {
      const fullExpression = expression + display;
      // Use a safe evaluation or a simple math parser
      // For a CNC app, we can just use Function() safely on numbers and operators
      // eslint-disable-next-line no-new-func
      const result = new Function(`return ${fullExpression.replace(/×/g, '*').replace(/÷/g, '/')}`)();
      const roundedResult = Math.round(result * 1000000) / 1000000;
      setDisplay(roundedResult.toString());
      setExpression('');
      setLastResult(roundedResult);
    } catch (e) {
      setDisplay('Error');
    }
  };

  const clear = () => {
    setDisplay('0');
    setExpression('');
    setLastResult(null);
  };

  const sendToConverter = () => {
    const val = parseFloat(display);
    if (!isNaN(val)) {
      setMmValue(val.toString());
      handleMmChange(val.toString());
      setActiveTab('converter');
    }
  };

  const handleMmChange = (val: string) => {
    setMmValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const inches = mmToInches(num);
      setInchValue(inches.toFixed(4));
      setFractionValue(decimalToFraction(inches));
    } else {
      setInchValue('');
      setFractionValue('');
    }
  };

  const handleInchChange = (val: string) => {
    setInchValue(val);
    const num = parseFloat(val);
    if (!isNaN(num)) {
      const mm = inchesToMm(num);
      setMmValue(mm.toFixed(3));
      setFractionValue(decimalToFraction(num));
    } else {
      setMmValue('');
      setFractionValue('');
    }
  };
  
  const handleFractionChange = (val: string) => {
    setFractionValue(val);
    const num = fractionToDecimal(val);
    if (!isNaN(num)) {
      setInchValue(num.toFixed(4));
      setMmValue(inchesToMm(num).toFixed(3));
    } else {
      // Just clear others if typing nonsense, but keep fractionValue for typing
      if (val === '') {
        setInchValue('');
        setMmValue('');
      }
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Maybe show a toast
  };

  useEffect(() => {
    if (isOpen) {
        // Reset state or something if needed
    }
  }, [isOpen]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col h-full max-h-[90vh]">
        {/* Header */}
        <div className="p-4 border-b border-white/10 flex justify-between items-center bg-surface">
          <div className="flex items-center gap-3">
            <Calculator className="w-6 h-6 text-primary" />
            <h2 className="text-xl font-bold text-text-primary">{t('calculator.title', 'Calculator & Converter')}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-text-secondary hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/10 bg-surface">
          <button
            onClick={() => setActiveTab('calculator')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'calculator' ? 'border-primary text-primary bg-primary/10' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('calculator.tab_calc', 'Calculator')}
          </button>
          <button
            onClick={() => setActiveTab('converter')}
            className={`flex-1 py-3 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'converter' ? 'border-primary text-primary bg-primary/5' : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            {t('calculator.tab_conv', 'Unit Converter')}
          </button>
        </div>

        {/* Content */}
        <div className="flex-grow p-6 overflow-y-auto">
          {activeTab === 'calculator' ? (
            <div className="max-w-xs mx-auto">
              {/* Display */}
              <div className="bg-black p-4 rounded-xl mb-6 border border-white/5 text-right font-mono overflow-hidden shadow-inner">
                <div className="text-text-secondary text-xs h-4 mb-1 truncate">{expression}</div>
                <div className="text-3xl font-bold text-white truncate">{display}</div>
              </div>

              {/* Pad */}
              <div className="grid grid-cols-4 gap-3">
                <button onClick={clear} className="col-span-2 p-4 bg-red-500/20 text-red-400 font-bold rounded-xl hover:bg-red-500/30 transition-colors">AC</button>
                <button onClick={() => setDisplay(display.slice(0, -1) || '0')} className="p-4 bg-white/5 text-text-secondary font-bold rounded-xl hover:bg-white/10 transition-colors">DEL</button>
                <button onClick={() => handleOperator('/')} className="p-4 bg-primary/20 text-primary font-bold rounded-xl hover:bg-primary/30 transition-colors">÷</button>
                
                <button onClick={() => handleNumber('7')} className="p-4 bg-white/5 text-text-primary font-bold rounded-xl hover:bg-white/10 transition-colors">7</button>
                <button onClick={() => handleNumber('8')} className="p-4 bg-white/5 text-text-primary font-bold rounded-xl hover:bg-white/10 transition-colors">8</button>
                <button onClick={() => handleNumber('9')} className="p-4 bg-white/5 text-text-primary font-bold rounded-xl hover:bg-white/10 transition-colors">9</button>
                <button onClick={() => handleOperator('*')} className="p-4 bg-primary/20 text-primary font-bold rounded-xl hover:bg-primary/30 transition-colors">×</button>
                
                <button onClick={() => handleNumber('4')} className="p-4 bg-white/5 text-text-primary font-bold rounded-xl hover:bg-white/10 transition-colors">4</button>
                <button onClick={() => handleNumber('5')} className="p-4 bg-white/5 text-text-primary font-bold rounded-xl hover:bg-white/10 transition-colors">5</button>
                <button onClick={() => handleNumber('6')} className="p-4 bg-white/5 text-text-primary font-bold rounded-xl hover:bg-white/10 transition-colors">6</button>
                <button onClick={() => handleOperator('-')} className="p-4 bg-primary/20 text-primary font-bold rounded-xl hover:bg-primary/30 transition-colors">-</button>
                
                <button onClick={() => handleNumber('1')} className="p-4 bg-white/5 text-text-primary font-bold rounded-xl hover:bg-white/10 transition-colors">1</button>
                <button onClick={() => handleNumber('2')} className="p-4 bg-white/5 text-text-primary font-bold rounded-xl hover:bg-white/10 transition-colors">2</button>
                <button onClick={() => handleNumber('3')} className="p-4 bg-white/5 text-text-primary font-bold rounded-xl hover:bg-white/10 transition-colors">3</button>
                <button onClick={() => handleOperator('+')} className="p-4 bg-primary/20 text-primary font-bold rounded-xl hover:bg-primary/30 transition-colors">+</button>
                
                <button onClick={() => handleNumber('0')} className="p-4 bg-white/5 text-text-primary font-bold rounded-xl hover:bg-white/10 transition-colors">0</button>
                <button onClick={() => handleNumber('.')} className="p-4 bg-white/5 text-text-primary font-bold rounded-xl hover:bg-white/10 transition-colors">.</button>
                <button onClick={sendToConverter} title="Send to unit converter" className="p-4 bg-white/5 text-yellow-400 font-bold rounded-xl hover:bg-white/10 transition-colors flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5" />
                </button>
                <button onClick={calculate} className="p-4 bg-primary text-white font-bold rounded-xl hover:opacity-90 transition-opacity">=</button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid gap-6">
                {/* Metric */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary flex items-center gap-2">
                    <Ruler className="w-4 h-4" />
                    Metric (mm)
                  </label>
                  <div className="relative group">
                    <NumberInput
                      id="mm-input"
                      value={mmValue}
                      onChange={handleMmChange}
                      placeholder="0.000"
                      label="Metric (mm)"
                      unit="mm"
                    />
                    <button 
                      onClick={() => copyToClipboard(mmValue)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-text-secondary hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Copy"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v1h12V5a2 2 0 00-2-2h-3v1H9V3H6z" />
                        <path d="M4 8h12v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                      </svg>
                    </button>
                  </div>
                </div>

                <div className="flex justify-center">
                   <ArrowRightLeft className="w-6 h-6 text-primary rotate-90" />
                </div>

                {/* Inch Decimals */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Inch Decimals</label>
                  <div className="relative group">
                    <NumberInput
                      id="inch-input"
                      value={inchValue}
                      onChange={handleInchChange}
                      placeholder="0.0000"
                      label="Inch Decimals"
                      unit="in"
                    />
                    <button 
                      onClick={() => copyToClipboard(inchValue)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-text-secondary hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity z-10"
                      title="Copy"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v1h12V5a2 2 0 00-2-2h-3v1H9V3H6z" />
                        <path d="M4 8h12v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Inch Fractions */}
                <div className="space-y-2">
                  <label className="text-sm font-medium text-text-secondary">Inch Fractions (1/64 precision)</label>
                  <div className="relative group">
                    <TextInput
                      value={fractionValue}
                      onValueChange={handleFractionChange}
                      placeholder="0"
                      className="w-full text-center text-2xl font-mono"
                      label="Inch Fractions"
                    />
                    <button 
                      onClick={() => copyToClipboard(fractionValue)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-text-secondary hover:text-primary opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copy"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z" />
                        <path d="M6 3a2 2 0 00-2 2v1h12V5a2 2 0 00-2-2h-3v1H9V3H6z" />
                        <path d="M4 8h12v10a2 2 0 01-2 2H6a2 2 0 01-2-2V8z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-primary/10 rounded-xl border border-primary/20">
                <p className="text-xs text-primary text-center">
                  Tip: Use the calculator to perform complex math, then tap the conversion icon to see it in different units.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-white/5 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white/5 text-text-primary rounded-lg hover:bg-white/10 transition-colors"
          >
            {t('common.close', 'Close')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CalculatorModal;
