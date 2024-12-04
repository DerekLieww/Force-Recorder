import React, { useState } from 'react';
import { Modal } from './ui/Modal';
import { Button } from './ui/Button';
import { useNamesStore } from '../store/namesStore';

interface AddNameModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddNameModal({ isOpen, onClose }: AddNameModalProps) {
  const [newName, setNewName] = useState('');
  const addLocalName = useNamesStore((state) => state.addLocalName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newName.trim()) {
      addLocalName(newName.trim());
      setNewName('');
      onClose();
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add New Person">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            id="name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="Enter name"
            autoFocus
          />
        </div>
        
        <div className="flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={!newName.trim()}>
            Add Person
          </Button>
        </div>
      </form>
    </Modal>
  );
}